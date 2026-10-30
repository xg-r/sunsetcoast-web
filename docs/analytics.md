# 방문 분석 (GA4)

운영 측정 ID `G-0EYXLRZ2BJ` (웹 스트림 "선셋코스트"). 운영 도메인(sunsetcoast.kr)에서만 보낸다. 설정은 README "환경 변수".

## 인스타그램 유입 링크

인스타그램에 거는 링크는 아래 주소를 그대로 쓴다. GA4에서 **보고서 → 획득 → 트래픽 획득**의 "세션 소스/매체"가 `instagram / social`로, "세션 캠페인"이 아래 이름으로 나온다.

| 쓰는 곳 | 주소 | 캠페인 |
|---|---|---|
| **프로필 링크** | `https://www.sunsetcoast.kr/?utm_source=instagram&utm_medium=social&utm_campaign=profile` | `profile` |
| 스토리 링크 스티커 | `https://www.sunsetcoast.kr/?utm_source=instagram&utm_medium=social&utm_campaign=story` | `story` |
| DM 답장 | `https://www.sunsetcoast.kr/?utm_source=instagram&utm_medium=social&utm_campaign=dm` | `dm` |
| 반려견 게시물·DM (반려견 객실 목록으로 바로) | `https://www.sunsetcoast.kr/rooms/?pet=1&utm_source=instagram&utm_medium=social&utm_campaign=pet` | `pet` |

- 사이트 **안의** 링크에는 utm을 붙이지 않는다. 붙이면 GA4가 새 방문으로 세면서 원래 유입 경로(인스타그램)를 덮어쓴다.
- 새 캠페인이 필요하면 `utm_campaign` 값만 바꾼다 (영문 소문자·밑줄). 예: 이벤트 공지 `event_2027spring`.

## 클릭 이벤트

사이트가 보내는 이벤트. 모든 이벤트에 `page`(누른 페이지 경로)가 붙는다.

| 이벤트 | 언제 | 매개변수 |
|---|---|---|
| `booking_click` | 예약하기 버튼 | `platform`(ddnayo, naver), `placement`, `room`(객실 페이지일 때) |
| `call_click` | 전화 버튼·번호 | `placement`, `room` |
| `insta_click` | 인스타그램 링크 | `placement` |
| `map_click` | 네이버 지도·카카오맵 | `platform` |
| `partner_click` | 스테이디앤디 링크 | `placement` |
| `review_more_click` | 네이버 리뷰 더 보기 | |
| `video_play` · `video_youtube_click` | 방송 영상 재생 · 유튜브로 이동 | `video` |

`placement` 값: `hero`(홈 첫 화면), `dock`(화면 아래 고정 바), `reservation_how`(예약 안내), `group_rental`(전체 대관), `home_location`(홈 오시는 길), `insta_handle` · `insta_grid` · `insta_follow`(홈 인스타 영역), `news`, `footer`.

## GA4에서 한 번만 해 둘 설정

1. **맞춤 측정기준 등록** (안 하면 매개변수가 보고서에 안 나온다): 관리 → 데이터 표시 → 맞춤 정의 → 맞춤 측정기준 만들기. 범위는 **이벤트**, 이름과 이벤트 매개변수를 같게:
   `placement`, `platform`, `room`, `video`
2. **주요 이벤트 표시**: 관리 → 데이터 표시 → 이벤트에서 `booking_click`, `call_click` 오른쪽의 "주요 이벤트로 표시"를 켠다. 이벤트가 한 번 이상 들어온 뒤(배포 후)에 목록에 보인다.
3. **데이터 보존 기간**: 관리 → 데이터 수집 및 수정 → 데이터 보존. 개인정보처리방침(`/privacy/`)에 적은 기간과 같아야 한다.

## 보는 법

- 인스타그램에서 몇 명 왔나: 보고서 → 획득 → 트래픽 획득, 측정기준 "세션 소스/매체" 또는 "세션 캠페인"
- 인스타에서 온 사람이 예약 버튼을 눌렀나: 같은 보고서에서 "주요 이벤트" 열 (위 2번 설정 후)
- 예약 버튼을 어디서 많이 누르나: 보고서 → 참여도 → 이벤트 → `booking_click` → `placement`
