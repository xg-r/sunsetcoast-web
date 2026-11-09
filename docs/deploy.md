# 배포 (S3 + CloudFront, GitHub Actions)

`main`에 push하면 `.github/workflows/deploy.yml`이 자동으로 배포한다. Actions 탭의 **Deploy → Run workflow**로 직접 돌릴 수도 있다.
`design/`, `docs/`, `mocks/`, `*.md`만 바뀐 push는 배포하지 않는다.

```
npm ci → 이미지 캐시 복원 → typecheck → npm run build (out/) → AWS 로그인(OIDC) → scripts/deploy-s3.sh
```

`scripts/deploy-s3.sh`가 하는 일:

1. 해시 파일(`_next/static/`, `img/`, `og/`)을 `max-age=1년, immutable`로 올린다. 이미 있는 것은 건너뛰고, 지우지 않는다.
2. 나머지(HTML, `__next.*.txt`, 아이콘, robots, sitemap)를 `max-age=0`으로 올리고, 이번 빌드에 없는 파일은 지운다.
   해시 파일을 먼저 올리기 때문에 새 HTML이 아직 없는 JS를 가리키는 순간이 없다.
3. CloudFront `/*` 무효화 (한 달 1,000경로까지 무료, `/*`는 1경로로 센다).

> 배포는 CI(Linux) 빌드만 쓴다. Windows에서 빌드한 `out/`은 Next 16 프리페치 파일이 `__next.rooms/__PAGE__.txt`처럼 폴더로 나뉘어서, CloudFront에 그대로 올리면 페이지 이동 시 프리페치가 404가 난다.

## AWS 준비 (처음 한 번)

리전은 서울(`ap-northeast-2`). 인증서만 버지니아(`us-east-1`).

### 1. S3 버킷

- 이름 예: `sunsetcoast-web`
- 퍼블릭 액세스 차단 **모두 켬** (CloudFront만 읽는다). 정적 웹 사이트 호스팅은 **끔**.

### 2. 인증서 (ACM, us-east-1)

- `sunsetcoast.kr`, `www.sunsetcoast.kr` 로 요청, DNS 검증. 도메인 업체 DNS 화면에 ACM이 알려준 CNAME을 넣는다.

### 3. CloudFront Function

- 이름 `sunsetcoast-rewrite`, 런타임 **cloudfront-js-2.0**, 코드는 `infra/cloudfront-function.js` 그대로. 게시(Publish)까지.
- 하는 일: `/rooms` → `/rooms.html`, `/rooms/` → 301 `/rooms`, `sunsetcoast.kr` → 301 `www.sunsetcoast.kr` (정규 주소는 www).

### 4. CloudFront 배포

| 항목 | 값 |
|---|---|
| 원본 | S3 버킷 (REST 엔드포인트), **OAC** 새로 만들기 → 안내되는 버킷 정책을 버킷에 붙인다 |
| 뷰어 프로토콜 | Redirect HTTP to HTTPS |
| 캐시 정책 | `CachingOptimized` (관리형, 쿼리 문자열 무시 — `?pet=1`, `?_rsc=` 가 캐시를 쪼개지 않게) |
| 압축 | 켬 |
| 함수 연결 | Viewer request → CloudFront Function `sunsetcoast-rewrite` |
| 대체 도메인 | `sunsetcoast.kr`, `www.sunsetcoast.kr` + 2번 인증서 |
| 기본 루트 객체 | `index.html` |
| 오류 페이지 | 403 → `/404.html`, 응답 코드 404 / 404 → `/404.html`, 응답 코드 404 (없는 경로를 S3가 403으로 돌려준다) |
| 가격 등급 | 북미·유럽·아시아 포함 (`PriceClass_200`) |

### 5. GitHub 로그인용 IAM 역할 (OIDC, 액세스 키 없음)

1. IAM → 자격 증명 공급자 → OpenID Connect 추가: URL `https://token.actions.githubusercontent.com`, 대상 `sts.amazonaws.com`
2. 역할 만들기 (웹 자격 증명, 위 공급자). 이름 예 `sunsetcoast-github-deploy`. 신뢰 정책:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::<계정ID>:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:xg-r@96982575/sunsetcoast-web@1435488955:environment:production"
      }
    }
  }]
}
```

   `sub`는 GitHub의 고정 ID 형식(`소유자@ID/저장소@ID`)이다. 이 저장소는 immutable subject가 켜져 있어서 `repo:xg-r/sunsetcoast-web:…`로 쓰면 `Not authorized to perform sts:AssumeRoleWithWebIdentity`가 난다.
   현재 형식 확인: `gh api repos/xg-r/sunsetcoast-web/actions/oidc/customization/sub` → `sub_claim_prefix` 뒤에 `:environment:production`을 붙인다.

3. 권한 정책 (인라인):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "s3:ListBucket", "Resource": "arn:aws:s3:::<버킷>" },
    { "Effect": "Allow", "Action": ["s3:PutObject", "s3:DeleteObject"], "Resource": "arn:aws:s3:::<버킷>/*" },
    { "Effect": "Allow", "Action": "cloudfront:CreateInvalidation", "Resource": "arn:aws:cloudfront::<계정ID>:distribution/<배포ID>" }
  ]
}
```

### 6. GitHub 저장소 설정

Settings → Environments → **production** 만들기 (워크플로가 이 환경 이름으로 로그인한다. 승인 규칙은 선택).

Settings → Secrets and variables → Actions → **Variables**:

| 이름 | 값 |
|---|---|
| `AWS_ROLE_ARN` | 5번 역할 ARN |
| `S3_BUCKET` | 1번 버킷 이름 |
| `CLOUDFRONT_DISTRIBUTION_ID` | 4번 배포 ID (`E…`) |
| `AWS_REGION` | (선택) 기본 `ap-northeast-2` |
| `NEXT_PUBLIC_API_BASE_URL` | (선택) 백엔드 주소. 비우면 노을 시각을 숨긴다 |

비밀값이 없어서 Secrets는 쓰지 않는다. GA4 ID는 저장소의 `.env.production`에서 읽는다.

### 7. 도메인 연결

먼저 CloudFront 기본 주소(`d….cloudfront.net`)로 열어 확인한 뒤 DNS를 바꾼다.

- `www.sunsetcoast.kr` → CNAME `d….cloudfront.net`
- `sunsetcoast.kr`(루트) → CNAME을 걸 수 없어서 업체가 ALIAS/ANAME/CNAME 플래트닝을 지원해야 한다. 지원하지 않으면 네임서버를 Route 53으로 옮기고 A(별칭) 레코드를 쓴다 (호스팅 영역 월 0.5달러).

## 확인

- Actions 로그의 "S3 업로드 + CloudFront 무효화" 단계에 `무효화 I… 요청`이 찍히면 끝. 1~3분 뒤 반영.
- 로컬에서 CloudFront 규칙 흉내: `npm run build && npm run serve` (http://localhost:4173)
- `infra/cloudfront-function.js`를 고쳤으면 CloudFront 콘솔에서 다시 게시해야 반영된다 (워크플로는 함수를 배포하지 않는다).
