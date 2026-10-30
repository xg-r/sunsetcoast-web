import Link from 'next/link';
import { getSiteData } from '@/lib/data';
import { MENU } from '@/lib/menu';
import { partnerUrl } from '@/lib/seo';

export function SiteFooter() {
  const data = getSiteData();
  const { settings: s } = data;
  const partner = partnerUrl(data, 'footer');
  return (
    <footer className="border-t border-line pb-32 pt-10 text-[13px] text-mute">
      <div className="wrap grid gap-8 md:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-1">
          <span className="font-script text-3xl text-coral">See you at sunset</span>
          <b className="mt-2 font-display text-base text-ink">{s.name}</b>
          <span>{s.address}</span>
          <span>대표 {s.owner} · 사업자등록번호 {s.businessNo}</span>
          <span>
            예약·문의 {s.phone} ({s.phoneHours})
          </span>
          <span>
            입금 계좌 {s.bankAccount.bank} {s.bankAccount.number} (예금주 {s.bankAccount.holder})
          </span>
          <span>
            인스타그램{' '}
            <a className="underline underline-offset-2" href={`https://www.instagram.com/${s.instagram}/`} target="_blank" rel="noopener">
              @{s.instagram}
            </a>
            {' · '}제휴 숙소{' '}
            {partner ? (
              <a className="underline underline-offset-2" href={partner} target="_blank" rel="noopener" data-track="partner_click" data-placement="footer">{s.partner.name}</a>
            ) : (
              s.partner.name
            )}
          </span>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
          {MENU.slice(1).map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="inline-block py-1 hover:text-ink">{m.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
