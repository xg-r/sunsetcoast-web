import { BookingDock } from '@/components/BookingDock';
import { CopyButton } from '@/components/CopyButton';
import { Icon } from '@/components/Icon';
import { getSiteData } from '@/lib/data';
import { bookingFor, won } from '@/lib/rooms';
import { faqJsonLd, jsonLd, pageMeta, partnerUrl } from '@/lib/seo';

const data = getSiteData();
export const metadata = pageMeta(data, {
  title: '예약 안내',
  description: '선셋코스트 예약 방법, 애견동반 요금과 규정, 추가 인원 요금, 이용·환불 규정, 워크숍·단체 전체 대관(최대 50명)과 자주 묻는 질문. 모든 카라반에 개별 화장실이 있어요.',
  path: '/reservation/',
});

export default function ReservationPage() {
  const { settings: s, policies: p, extraPersonFee: fee, groupRental: g } = data;
  const booking = bookingFor(data);
  const partner = partnerUrl(data, 'group_rental');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqJsonLd(data))} />
      <section className="wrap flex flex-col gap-3 pt-6">
        <span className="eyebrow">book your stay</span>
        <h1 className="h2">예약 안내</h1>
        <nav aria-label="이 페이지 목차" className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5 text-[13px]">
          {[['how', '예약 방법'], ['pet', '반려견 동반'], ['rates', '요금'], ['rules', '이용 규정'], ['refund', '환불 규정'], ['group', '전체 대관'], ['faq', '자주 묻는 질문']].map(([id, l]) => (
            <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-line bg-surface px-3.5 py-1.5">{l}</a>
          ))}
        </nav>
      </section>

      <div className="wrap mt-8 grid gap-x-16 gap-y-12 md:grid-cols-2">
        <section id="how" className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="h2">예약 방법</h2>
          <p className="text-[14px] text-mute">온라인으로 날짜를 골라 예약하거나, 전화로 편하게 물어봐 주세요.</p>
          <div className="flex flex-wrap gap-2">
            {booking.map((b, i) => (
              <a key={b.key} href={b.url} target="_blank" rel="noopener" className={`btn ${i ? 'btn-ghost' : 'btn-primary'}`} data-track="booking_click" data-platform={b.key} data-placement="reservation_how">{b.label}</a>
            ))}
            <a href={`tel:${s.phone.replaceAll('-', '')}`} className="btn btn-ghost" data-track="call_click" data-placement="reservation_how">전화 {s.phone}</a>
          </div>
          <p className="text-[13px] text-mute">전화 상담 {s.phoneHours}</p>
          <div className="card mt-2 flex items-center justify-between gap-3 p-4 text-[14px]">
            <div>
              <span className="block text-xs text-mute">입금 계좌 · 예금주 {s.bankAccount.holder}</span>
              {s.bankAccount.bank} <b className="tabular-nums">{s.bankAccount.number}</b>
            </div>
            <CopyButton text={`${s.bankAccount.bank} ${s.bankAccount.number}`} label="계좌 복사" />
          </div>
        </section>

        <section id="pet" className="flex scroll-mt-20 flex-col gap-3 rounded-3xl bg-apricot/60 p-5 md:p-7">
          <h2 className="h2">반려견과 함께라면</h2>
          <p className="text-[14px]">
            {data.rooms.filter((r) => r.visible && r.petsAllowed).map((r) => r.name).join(', ')} 객실에서 반려견과 함께 묵을 수 있어요.
          </p>
          <table className="w-full text-[14px]">
            <tbody>
              {data.petPolicy.fees.map((f) => (
                <tr key={f.condition} className="border-b border-ink/10">
                  <th scope="row" className="py-2 text-left font-normal">{f.condition}</th>
                  <td className="py-2 text-right font-medium">{f.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.petPolicy.notes.length > 0 && (
            <ul className="flex flex-col gap-1.5 text-[14px]">{data.petPolicy.notes.map((n) => <li key={n} className="flex gap-2"><Icon name="check" className="mt-1 size-4 text-coral" />{n}</li>)}</ul>
          )}
        </section>

        <section id="rates" className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="h2">요금</h2>
          <ul className="flex flex-col text-[14px]">
            {data.rateSeasons.map((rs) => (
              <li key={rs.key} className="flex justify-between border-b border-line py-2.5">
                <span>{rs.name}</span>
                <span className="text-mute">{rs.description}</span>
              </li>
            ))}
          </ul>
          <p className="text-[14px]">
            기준 인원을 넘으면 성인 1인 <b>{won(fee.adult)}</b>, 아동 1인 <b>{won(fee.child)}</b>이에요. 24개월 미만은 <b>{fee.infantFreeCount}명까지 무료</b>예요.
          </p>
          <p className="text-[13px] text-mute">객실별 요금은 각 객실 페이지에 있어요. 실제 요금과 예약 가능 여부는 예약 페이지 기준이에요.</p>
        </section>

        <section id="rules" className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="h2">이용 규정</h2>
          <dl className="grid grid-cols-[4.5rem_1fr] gap-y-1 text-[14px]">
            <dt className="text-mute">입실</dt><dd>{p.checkIn} · {p.checkInNote}</dd>
            <dt className="text-mute">퇴실</dt><dd>{p.checkOut}</dd>
          </dl>
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px]">
            {p.rules.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>


        <section id="refund" className="flex scroll-mt-20 flex-col gap-3">
          <h2 className="h2">환불 규정</h2>
          <table className="w-full text-[14px] tabular-nums">
            <thead>
              <tr className="border-b border-ink/40 text-left text-xs text-mute">
                <th className="py-2 font-normal">이용일 기준</th>
                <th className="py-2 text-right font-normal">취소 수수료</th>
              </tr>
            </thead>
            <tbody>
              {p.refund.map((r) => (
                <tr key={r.when} className="border-b border-line">
                  <td className="py-2">{r.when}</td>
                  <td className="py-2 text-right font-medium">{r.fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="flex flex-col gap-1 text-[13px] text-mute">
            {p.refundNotes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        </section>

        <section id="group" className="card flex scroll-mt-20 flex-col gap-5 p-5 md:col-span-2 md:grid md:grid-cols-[1fr_1fr] md:gap-x-12 md:p-8">
          <div className="flex flex-col gap-3">
            <span className="eyebrow">group stay</span>
            <h2 className="h2">캠핑장 전체 대관</h2>
            <p className="text-[14px]">
              워크숍, 단체 여행, 행사로 카라반 {data.rooms.filter((r) => r.visible).length}동과 캠핑장 전체를 빌릴 수 있어요.
              기준 <b>{g.guestsBase}명</b>, 추가 인원까지 <b>{g.guestsMax}명</b>이 묵을 수 있어요.
            </p>
            {g.neighborNote && (
              <p className="text-[13px] text-mute">
                {g.neighborNote}
                {partner && (
                  <>
                    {' '}
                    <a href={partner} target="_blank" rel="noopener" className="font-semibold text-coral underline underline-offset-2" data-track="partner_click" data-placement="group_rental">
                      {s.partner.name} 보기
                    </a>
                  </>
                )}
              </p>
            )}
            <div className="mt-1 flex flex-col gap-1.5">
              <a href={`tel:${s.phone.replaceAll('-', '')}`} className="btn btn-primary self-start" data-track="call_click" data-placement="group_rental">
                <Icon name="phone" className="size-4" />
                대관 문의 {s.phone}
              </a>
              <p className="text-[13px] text-mute">요금은 날짜와 인원에 따라 달라서 전화로 안내해 드려요 · {s.phoneHours}</p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h3 className="text-[13px] font-semibold text-mute">함께 준비할 수 있어요</h3>
              <ul className="flex flex-wrap gap-1.5">
                {g.features.map((f) => <li key={f} className="chip">{f}</li>)}
              </ul>
            </div>
            {g.cases.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-[13px] font-semibold text-mute">이렇게 이용했어요</h3>
                <ul className="flex flex-col text-[14px]">
                  {g.cases.map((c) => (
                    <li key={c.who} className="flex flex-wrap justify-between gap-x-3 border-b border-line py-2.5">
                      <span>{c.who}</span>
                      <span className="text-mute">{c.stay}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section id="faq" className="flex scroll-mt-20 flex-col gap-3 md:col-span-2">
          <h2 className="h2">자주 묻는 질문</h2>
          <div className="flex flex-col border-t border-line">
            {data.faqs.map((f, i) => (
              <details key={f.q} open={i === 0} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="text-xl text-mute transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="pb-4 text-[14px] text-mute">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
      <BookingDock />
    </>
  );
}
