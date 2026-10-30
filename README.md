# 선셋코스트 홈페이지

선셋코스트 카라반 & 캠핑장 고객 사이트. Next.js 정적 export → S3 + CloudFront.
데이터(객실·사진·요금·규정·리뷰·방송)는 DB 없이 `src/lib/seed`에서 관리하고, 고친 뒤 다시 빌드·배포한다. 방문자는 빌드된 HTML만 받는다. 노을 시각만 브라우저에서 백엔드에 묻는다.

> 진행 상황: 3단계(고객 페이지, seed 데이터) 완료. DB·관리자 화면은 만들지 않는다 (필요해지면 그때 개발). 다음은 5단계 배포.

## 로컬 실행

Node 20.9 이상 (개발 환경은 Windows Node 24).

```bash
npm install
npm run dev        # 이미지 생성 후 개발 서버 (http://localhost:3000)
npm run build      # 이미지 생성 + 정적 빌드 → out/
npm run serve      # out/ 을 CloudFront처럼 서빙 (http://localhost:4173)
npm run mock       # 백엔드 목 서버 (http://localhost:8080/sunset-time)
```

처음 한 번 `.env.example`을 `.env.local`로 복사한다.

## 환경 변수

| 이름 | 용도 |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | 백엔드 주소. 로컬은 `http://localhost:8080`(목 서버). 빌드 때 JS에 들어간다. 비우면 노을 시각을 숨긴다 |

## 백엔드 API

백엔드는 추후 개발. 지금은 `scripts/mock-backend.mjs`가 `mocks/`의 목 데이터로 같은 계약을 따른다.

| 엔드포인트 | 쓰는 곳 | 계약 |
|---|---|---|
| `GET /sunset-time` | 홈의 오늘 노을 시각 (브라우저에서) | `docs/api/sunset-time.md` |

장애 확인: `MOCK_MODE=error|slow|invalid`로 목 서버를 띄운다 (Windows cmd는 `set MOCK_MODE=error&& npm run mock`).
`design/_tools/sunset-check.mjs`가 다섯 경우(정상·오류·지연·형식 오류·서버 없음)를 자동으로 확인한다.

## 구조

| 경로 | 내용 |
|---|---|
| `src/app/` | 페이지 (홈, 객실 목록·상세·비교, 시설, 예약 안내, 소식, 오시는 길, 소개) |
| `src/lib/types.ts` | 데이터 타입 |
| `src/lib/seed/` | 사이트 데이터 원본. 확인된 값만, 모르는 값은 null |
| `src/lib/data.ts` | 빌드 때 데이터를 읽는 유일한 입구 (seed + 사진 목록) |
| `src/lib/rooms.ts` | "~원부터", 필터, 함께 보면 좋은 객실 등 계산 |
| `photos/` | 원본 사진. 파일명 규칙은 `photos/README.md` |
| `data/location.json` | 캠핑장 좌표 (지도·구조화 데이터) |
| `scripts/build-images.mjs` | 사진 → AVIF/WebP 4가지 크기 + OG 이미지. 해시 파일명, 바뀐 것만 다시 인코딩 |
| `design/` | 2단계 시안, 스크린샷·동작 확인 스크립트(`design/_tools`) |

## 설계 선택

- **이미지**: next/image 최적화는 정적 export에서 동작하지 않아 빌드 전에 sharp로 만든다. 파일명에 원본 해시가 있어 CloudFront 1년 캐시가 안전하다.
- **브라우저에 넘기는 데이터 최소화**: 이미지 목록(JSON)은 서버 컴포넌트에서만 읽고, 갤러리·필터 같은 클라이언트 컴포넌트에는 미리 그린 요소를 넘긴다.
- **필터 상태**: URL 쿼리(`?tier=&pet=1&guests=3-4`)에 남겨 카카오톡 공유 시 유지. 정적 HTML에는 14개 카드가 모두 있다.
- **카카오톡 공유**: Web Share API(휴대폰 공유 시트). 카카오 SDK는 앱 키 등록이 필요해 쓰지 않는다. 미리보기는 페이지별 OG 태그.
- **분석**: `data-track` 속성을 한 곳(Analytics)에서 기록. GA4 측정 ID가 없으면 아무것도 보내지 않는다.

## 배포 시 주의 (5단계)

CloudFront Function에 필요한 규칙:
1. `/rooms/nolmeong/` → `/rooms/nolmeong/index.html`
2. Next 16 세그먼트 프리페치: `.../__next.rooms.__PAGE__.txt` → `.../__next.rooms/__PAGE__.txt`
   (점으로 이어진 이름의 첫 조각 뒤를 폴더로). `scripts/serve-out.mjs`의 `rewriteSegmentPrefetch` 참고
3. 기존 URL 301 리다이렉트 (지시서 11장)
