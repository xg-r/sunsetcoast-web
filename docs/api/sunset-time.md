# GET /sunset-time

캠핑장 위치의 오늘·내일 일몰 시각. 홈 화면 "오늘 노을 17:50"에 쓴다.
백엔드는 추후 개발 예정이며, 지금은 `scripts/mock-backend.mjs`(목 서버, 포트 8080)가 같은 계약으로 응답한다.

## 요청

```
GET {NEXT_PUBLIC_API_BASE_URL}/sunset-time
```

파라미터 없음. 위치는 캠핑장 한 곳으로 고정 (백엔드 설정).

## 응답 200

```json
{
  "today":    { "date": "2026-10-27", "sunset": "17:50" },
  "tomorrow": { "date": "2026-10-28", "sunset": "17:49" }
}
```

| 필드 | 형식 | 설명 |
|---|---|---|
| `date` | `YYYY-MM-DD` | 한국 시간(KST) 기준 날짜 |
| `sunset` | `HH:MM` (24시간) | 한국 시간 일몰 시각 |

- 오늘 해가 진 뒤에는 화면이 `tomorrow`를 보여준다. 그래서 둘 다 필요하다.
- 실패는 2xx가 아닌 상태 코드로 응답한다 (본문 형식 자유).

## 백엔드에 기대하는 것

- **캐시**: 백엔드가 관리한다. 프론트는 캐시하지 않고(`cache: 'no-store'`) 화면에 들어올 때마다 조회한다.
  `today.date`는 요청 시점의 한국 날짜여야 한다 (캐시는 한국 시간 자정에 날짜가 넘어가야 함).
- **원본 장애**: 캐시가 있으면 캐시로 응답, 없으면 오류(503 등). 프론트가 처리한다.
- **CORS**: 사이트와 다른 도메인이면 `Access-Control-Allow-Origin: https://www.sunsetcoast.kr` (GET만).
- **응답 시간**: 프론트는 4초까지만 기다린다.

## 프론트의 장애 처리 (src/components/SunsetTime.tsx)

다음 중 하나면 노을 시각 영역을 숨기고 나머지 화면은 그대로 보여준다.

- `NEXT_PUBLIC_API_BASE_URL`이 비어 있음
- 4초 안에 응답 없음, 네트워크 오류, 2xx가 아님
- 형식이 계약과 다름 (`today`·`tomorrow` 모두 `YYYY-MM-DD`, `HH:MM` 검사)

날짜가 맞는지는 프론트가 검사하지 않는다. 받은 `today`의 시각이 지났으면 `tomorrow`를 보여준다.

목 서버로 확인: `MOCK_MODE=error npm run mock`, `MOCK_MODE=slow npm run mock`, `MOCK_MODE=invalid npm run mock`
