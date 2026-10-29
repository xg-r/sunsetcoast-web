# GET /site-data

홈페이지에 나오는 데이터 전체(객실, 등급, 사진 목록, 요금, 규정, 리뷰, 소식 등). DB와 관리자 기능은 백엔드가 맡는다.
지금은 `scripts/mock-backend.mjs`(목 서버, 포트 8080)가 같은 계약으로 응답한다. 응답 예시 전체: `mocks/site-data.json`

## 언제 부르나: 빌드 때 한 번

방문자 브라우저는 이 API를 부르지 않는다. 사이트는 정적 HTML이고, **빌드할 때만** 서버끼리 한 번 부른다.

```
관리자에서 저장 → (백엔드) 배포 훅 호출 → 빌드: GET /site-data → HTML 생성 → S3 + CloudFront
```

- 네이버 검색 로봇이 객실 정보를 그대로 읽고, 첫 화면이 바로 뜨고, 백엔드가 멈춰도 사이트는 정상이다.
- 관리자에서 고친 내용은 빌드가 끝나는 2~3분 뒤에 반영된다.
- 노을 시각처럼 매일 바뀌고 없어도 되는 값만 브라우저에서 직접 부른다 (`docs/api/sunset-time.md`).

## 요청

```
GET {SITE_DATA_API_URL}/site-data
Authorization: Bearer {SITE_DATA_TOKEN}
Accept: application/json
```

- 빌드 서버만 부르므로 CORS는 필요 없다. 토큰으로 막는다 (숨긴 객실·작성 중인 소식도 들어 있음).
- 프론트는 30초까지 기다린다.

## 응답 200

`src/lib/types.ts`의 `SiteData`와 **같은 모양**이다. 타입 파일이 필드 정의의 기준이다.

| 키 | 형식 | 내용 |
|---|---|---|
| `settings` | 객체 | 상호, 주소, 좌표, 전화, 계좌, 인스타그램, 네이버 플레이스 번호, 예약 플랫폼 버튼, SEO 문구 |
| `tiers` | 배열 | 객실 등급 (스페이스카라반 `premium`, 에어스트림 `airstream`, 스탠다드 `value`) |
| `rooms` | 배열 | 객실 14동. 사진 목록(`images`)을 객실 안에 넣는다. 숨긴 객실도 `visible: false`로 보낸다 |
| `amenities` | 배열 | 시설 이름·아이콘 목록 (`rooms[].amenityKeys`가 참조) |
| `rateSeasons` | 배열 | 요금 구분: `offWeekday` 비수기 평일, `offWeekend` 비수기 주말, `peakWeekday` 성수기 평일, `peakWeekend` 성수기 주말 |
| `peakPeriods` | 배열 | 성수기 기간 `{ start, end, label }` (`YYYY-MM-DD`). 없으면 `[]` |
| `rates` | 배열 | `{ roomSlug, seasonKey, price }` — 객실 × 요금 구분. `price`는 원 단위 정수 |
| `extraPersonFee` | 객체 | 추가 인원 요금 (성인, 아동, 무료 유아 수, 객실별 예외) |
| `petPolicy` | 객체 | 반려견 요금(`fees`)과 규정(`notes`) |
| `policies` | 객체 | 입실·퇴실, 이용 규정, 환불 규정 |
| `posts` | 배열 | 공지·이벤트·돌고래 소식 |
| `reviews` | 배열 | 네이버 방문자 리뷰 (아래 "리뷰 개인정보") |
| `faqs` | 배열 | 자주 묻는 질문 `{ q, a }` |
| `services` | 배열 | 바베큐, 자전거 같은 서비스 |
| `commonFacilities` | 문자열 배열 | 공용 시설 |
| `tours` | 배열 | 주변 여행지 |

```json
{
  "settings": { "name": "선셋코스트 카라반 & 캠핑장", "siteUrl": "https://www.sunsetcoast.kr", "naverPlaceId": "1203944529", "...": "..." },
  "tiers": [{ "key": "premium", "name": "스페이스카라반", "intro": "…", "coverImage": "site/tier/premium-01", "sortOrder": 1 }],
  "rooms": [{
    "slug": "nolmeong", "name": "놀멍", "tierKey": "premium", "petsAllowed": true, "visible": true, "sortOrder": 1,
    "guestsBase": 2, "guestsMax": 4, "beds": "퀸 1", "shower": null, "bathtub": null,
    "images": [{ "key": "rooms/nolmeong/cover-01", "category": "cover", "caption": "해 질 녘의 스페이스카라반", "alt": "…", "sortOrder": 1 }],
    "...": "..."
  }],
  "rateSeasons": [{ "key": "offWeekday", "name": "비수기 평일", "description": "일~금", "sortOrder": 1 }],
  "rates": [{ "roomSlug": "nolmeong", "seasonKey": "offWeekday", "price": 230000 }],
  "reviews": [{ "id": "nolmeong-01", "roomSlug": "nolmeong", "companion": "연인 · 반려견", "visitedMonth": "2026-09", "body": "…", "keywords": ["깨끗해요"], "source": "naver", "featured": true, "sortOrder": 1 }],
  "...": "..."
}
```

## 값 규칙

- **모르는 값은 `null`**. 화면은 `null`을 "확인 중", "준비 중"으로 보여준다. 기본값을 지어내서 채우지 않는다.
- **`slug`, `key`는 URL과 연결**되므로 한번 정하면 바꾸지 않는다 (`/rooms/nolmeong/`, `?tier=premium`). 이름(`name`)은 자유롭게 바꿔도 된다.
- **순서**는 `sortOrder` 오름차순.
- **금액**은 원 단위 정수 (`230000`). 표시 형식("230,000원")은 프론트가 만든다.
- **날짜**는 한국 시간 `YYYY-MM-DD`, 리뷰 방문은 `YYYY-MM`.

## 리뷰 개인정보

리뷰는 작성자를 알아볼 수 있는 정보를 **저장도, 응답도 하지 않는다**: 닉네임, 프로필, 리뷰·사진 수, 몇 번째 방문, 정확한 방문일, 인증 수단.
허용 필드는 `id, roomSlug, companion, visitedMonth, body, keywords, source, featured, sortOrder`뿐이다. 다른 필드가 오면 빌드가 멈춘다.
본문은 맞춤법만 다듬고 뜻은 바꾸지 않는다. 관리자 화면에도 같은 규칙을 안내해 주세요.

## 사진

지금은 `images[].key`(예: `rooms/nolmeong/cover-01`)가 저장소의 `photos/` 폴더 파일을 가리키고, 빌드가 여러 크기로 변환한다.
관리자에서 사진을 올리게 되면 원본 주소를 함께 받아야 한다. 아래처럼 추가하는 것을 제안한다 (**아직 프론트 미구현**).

```json
"photos": [{ "key": "rooms/nolmeong/cover-01", "url": "https://…/원본.jpg", "updatedAt": "2026-10-28T06:00:00Z" }]
```

빌드가 `updatedAt`이 바뀐 사진만 내려받아 다시 변환한다. key 이름 규칙은 `photos/README.md`.

## 실패

- 2xx가 아니거나, 30초 안에 응답이 없거나, 형식이 계약과 다르면 **빌드가 멈춘다** (`scripts/fetch-site-data.mjs`).
  이전 배포가 그대로 남으므로 사이트는 안전하다. seed로 몰래 대신하지 않는다 (옛 요금이 배포되는 것을 막음).
- 프론트가 검사하는 것: 필수 배열·객체, 객실 slug 형식과 중복, 없는 등급·객실·요금 구분 참조, 금액이 양의 정수인지, 리뷰 허용 필드.

## 배포 훅

관리자에서 저장하면 백엔드가 배포 훅(빌드 시작 URL)을 부른다. 연속 저장은 1분 정도 모아서 한 번만 부른다.
훅의 형식(GitHub Actions `repository_dispatch` 등)은 배포를 만들 때(5단계) 정한다.

## 로컬에서 확인

```bash
npm run mock:data     # seed → mocks/site-data.json (seed를 고친 뒤 다시)
npm run mock          # 목 서버 :8080 (/sunset-time, /site-data)
# .env.local 에 SITE_DATA_API_URL=http://localhost:8080, SITE_DATA_TOKEN=dev-token
npm run build         # 목 서버에서 받아 빌드
```

장애 확인: `MOCK_MODE=error | slow | invalid npm run mock` → 빌드가 멈추는지 본다.
