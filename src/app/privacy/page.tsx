import { getSiteData } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

const data = getSiteData();
export const metadata = { ...pageMeta(data, { title: '개인정보처리방침', description: `${data.settings.name} 홈페이지의 개인정보처리방침.`, path: '/privacy/' }), robots: { index: false } };

// 내용을 바꾸면 시행일도 바꾸고, 이전 방침은 git 기록으로 남긴다.
// 보유 기간은 GA4 관리 → 데이터 수집 및 수정 → 데이터 보존 설정과 같아야 한다 (docs/analytics.md).
const EFFECTIVE_DATE = '2026년 11월 1일';
const GA_RETENTION = '2개월';
// 책임자 연락처는 이메일만 공개한다 (사이트의 전화번호는 현장 사장님 번호라 쓰지 않는다)
const PRIVACY_EMAIL = 'dhcns2762@naver.com';

export default function PrivacyPage() {
  const s = data.settings;
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="mt-4 font-display text-lg font-bold text-ink">{children}</h2>;
  return (
    <article className="wrap flex max-w-3xl flex-col gap-3 pb-10 pt-6 text-[14.5px] leading-relaxed [&_li]:ml-5 [&_ul]:list-disc">
      <span className="eyebrow">privacy</span>
      <h1 className="h2">개인정보처리방침</h1>
      <p className="text-mute">
        {s.name}(이하 &quot;캠핑장&quot;)은 「개인정보 보호법」에 따라 이용자의 개인정보를 보호하고 관련 고충을 신속하게 처리하기 위해 아래와 같이 개인정보처리방침을 정합니다.
        이 방침은 홈페이지({s.siteUrl.replace('https://', '')})에 적용됩니다.
      </p>

      <H>1. 처리하는 개인정보와 목적</H>
      <p>이 홈페이지에는 회원가입이나 문의 양식이 없어 이름·연락처 같은 개인정보를 직접 입력받지 않습니다. 다만 방문 통계를 위해 아래 정보가 자동으로 수집됩니다.</p>
      <ul>
        <li>수집 항목: 쿠키 식별자, 방문한 페이지와 시각, 들어온 경로(유입 경로), 누른 버튼, 기기·브라우저 종류, 대략적인 지역(국가·도시)</li>
        <li>목적: 홈페이지 이용 현황 분석과 개선</li>
      </ul>
      <p>예약은 외부 예약 서비스(떠나요 등)에서 이뤄지며, 예약할 때 입력하는 정보에는 해당 서비스의 개인정보처리방침이 적용됩니다.</p>

      <H>2. 보유 기간과 파기</H>
      <p>자동 수집된 방문 통계 정보는 수집 후 {GA_RETENTION}이 지나면 Google 애널리틱스에서 자동으로 삭제됩니다. 보고서에는 개인을 알아볼 수 없는 합계 수치만 남습니다.</p>

      <H>3. 제3자 제공</H>
      <p>캠핑장은 이용자의 개인정보를 제3자에게 제공하지 않습니다. 법령에 따라 요청받은 경우는 예외로 합니다.</p>

      <H>4. 처리 위탁과 국외 이전</H>
      <p>방문 통계 분석을 위해 아래와 같이 개인정보 처리를 위탁하며, 이 과정에서 정보가 국외로 이전됩니다.</p>
      <ul>
        <li>받는 자: Google LLC (Google 애널리틱스)</li>
        <li>이전되는 나라: 미국 등 Google 데이터센터 소재 국가</li>
        <li>이전 항목: 1번의 자동 수집 항목</li>
        <li>이전 시기와 방법: 홈페이지를 방문할 때 네트워크로 전송</li>
        <li>목적과 보유 기간: 방문 통계 분석, 수집 후 {GA_RETENTION}</li>
      </ul>
      <p>국외 이전을 원하지 않으면 5번의 방법으로 수집을 거부할 수 있습니다. 거부해도 홈페이지 이용에는 제한이 없습니다.</p>

      <H>5. 쿠키의 설치·운영과 거부</H>
      <p>캠핑장은 방문 통계를 위해 Google 애널리틱스 쿠키를 사용합니다. 쿠키는 브라우저에 저장되는 작은 파일로, 다시 방문했는지 구분하는 데 쓰입니다.</p>
      <ul>
        <li>브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있습니다. (예: Chrome 설정 → 개인정보 보호 및 보안 → 서드 파티 쿠키, Safari 설정 → 개인정보 보호)</li>
        <li>
          Google 애널리틱스 차단 부가기능을 설치하면 모든 사이트에서 수집을 거부할 수 있습니다:{' '}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener" className="text-coral underline underline-offset-2">tools.google.com/dlpage/gaoptout</a>
        </li>
      </ul>

      <H>6. 이용자의 권리와 행사 방법</H>
      <p>이용자는 언제든지 개인정보의 열람, 정정, 삭제, 처리정지를 요구할 수 있습니다. 아래 개인정보 보호책임자에게 이메일로 요청하시면 지체 없이 처리하겠습니다. 다만 방문 통계 정보는 개인을 알아볼 수 없는 형태로 처리되어 특정 이용자의 정보를 찾지 못할 수 있습니다.</p>

      <H>7. 안전성 확보 조치</H>
      <p>홈페이지와 방문자 사이의 모든 통신은 HTTPS로 암호화되며, 방문 통계 계정에는 운영자만 접근할 수 있도록 관리합니다.</p>

      <H>8. 개인정보 보호책임자</H>
      <ul>
        <li>책임자: {s.owner} (대표)</li>
        <li>
          이메일:{' '}
          <a href={`mailto:${PRIVACY_EMAIL}`} className="text-coral underline underline-offset-2">{PRIVACY_EMAIL}</a>
        </li>
      </ul>

      <H>9. 권익침해 구제 방법</H>
      <p>개인정보 침해에 대한 신고나 상담이 필요하면 아래 기관에 문의할 수 있습니다.</p>
      <ul>
        <li>개인정보침해신고센터: (국번 없이) 118 · privacy.kisa.or.kr</li>
        <li>개인정보분쟁조정위원회: 1833-6972 · www.kopico.go.kr</li>
        <li>대검찰청: (국번 없이) 1301 · www.spo.go.kr</li>
        <li>경찰청: (국번 없이) 182 · ecrm.police.go.kr</li>
      </ul>

      <H>10. 개인정보처리방침의 변경</H>
      <p>이 방침은 {EFFECTIVE_DATE}부터 적용됩니다. 내용이 바뀌면 시행 7일 전에 홈페이지에 알립니다.</p>
    </article>
  );
}
