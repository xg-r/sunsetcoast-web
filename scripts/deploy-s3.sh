#!/usr/bin/env bash
# out/ 을 S3에 올리고 CloudFront 캐시를 비운다. GitHub Actions(.github/workflows/deploy.yml)가 실행한다.
#   필요: S3_BUCKET, CLOUDFRONT_DISTRIBUTION_ID, AWS 자격 증명
#
# 캐시 규칙
#   - 파일명에 해시가 있는 것(_next/static, img, og): 1년 + immutable. 지우지 않는다
#     (배포 직전 HTML을 연 방문자가 옛 JS·이미지를 계속 받을 수 있게). 용량이 작아 쌓여도 괜찮다.
#     이름이 같으면 내용도 같으므로 --size-only 로 이미 있는 파일은 건너뛴다.
#   - 나머지(HTML, RSC .txt, 아이콘, robots, sitemap): 매번 확인(max-age=0). 배포에서 빠진 파일은 지운다.
#
# aws s3 sync 필터는 뒤에 쓴 것이 이긴다.
set -euo pipefail

: "${S3_BUCKET:?S3_BUCKET 이 필요합니다}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?CLOUDFRONT_DISTRIBUTION_ID 가 필요합니다}"

OUT="$(cd "$(dirname "$0")/.." && pwd)/out"
DEST="s3://$S3_BUCKET"
[ -f "$OUT/index.html" ] || { echo "out/index.html 이 없습니다. 먼저 npm run build" >&2; exit 1; }

IMMUTABLE='public, max-age=31536000, immutable'
REVALIDATE='public, max-age=0, must-revalidate'
HASHED=(--include '_next/static/*' --include 'img/*' --include 'og/*')

echo "1/3 해시 파일 (1년 캐시)"
# aws cli가 확장자로 추측하는 타입은 런타임마다 달라서 AVIF·WebP·woff2는 직접 정한다
aws s3 sync "$OUT" "$DEST" --exclude '*' "${HASHED[@]}" --exclude '*.avif' --exclude '*.webp' --exclude '*.woff2' \
  --size-only --cache-control "$IMMUTABLE" --only-show-errors
for t in avif:image/avif webp:image/webp woff2:font/woff2; do
  ext=${t%%:*}
  aws s3 sync "$OUT" "$DEST" --exclude '*' --include "_next/static/*.$ext" --include "img/*.$ext" --include "og/*.$ext" \
    --size-only --content-type "${t#*:}" --cache-control "$IMMUTABLE" --only-show-errors
done

echo "2/3 HTML·데이터 (매번 확인, 빠진 파일 삭제)"
# 해시 파일이 모두 올라간 뒤에 HTML을 바꾼다 → 새 HTML이 아직 없는 JS·이미지를 가리키는 순간이 없다
aws s3 sync "$OUT" "$DEST" --exclude '_next/static/*' --exclude 'img/*' --exclude 'og/*' \
  --delete --cache-control "$REVALIDATE" --only-show-errors

echo "3/3 CloudFront 무효화"
id=$(aws cloudfront create-invalidation --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" --paths '/*' --query Invalidation.Id --output text)
echo "무효화 $id 요청 (몇 분 안에 반영)"
