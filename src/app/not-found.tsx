import type { Metadata } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { MENU } from '@/lib/menu';

// 정적 export에서 out/404.html 로 나온다. CloudFront가 S3의 403/404를 이 페이지로 바꿔 보여 준다.
export const metadata: Metadata = { title: '페이지를 찾을 수 없어요' };

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[70vh] flex-col items-center justify-center py-12 text-center">
      <SunsetArt />
      <span className="eyebrow mt-6">Lost at sea</span>
      <h1 className="h2 mt-2">찾는 페이지가 노을 너머로 사라졌어요</h1>
      <p className="mt-3 max-w-sm text-[15px] text-mute">
        주소가 바뀌었거나 없어진 페이지예요.
        <br />
        예전 홈페이지 주소로 들어오셨다면 아래에서 다시 찾아 주세요.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn btn-primary">
          <Icon name="home" className="size-4" />
          홈으로
        </Link>
        <Link href="/rooms/" className="btn btn-ghost">
          객실 보기
        </Link>
      </div>
      <ul className="mt-10 grid w-full max-w-md grid-cols-2 gap-2 text-left sm:grid-cols-3">
        {MENU.slice(2).map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-3 py-2.5 text-sm transition-colors hover:border-peach">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-band text-coral">
                <Icon name={m.icon} className="size-4" />
              </span>
              {m.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** 바다 위로 지는 해와 "404" — 색은 사이트 토큰만 써서 다크 모드에서도 맞는다 */
function SunsetArt() {
  return (
    <svg viewBox="0 0 240 150" className="w-60 max-w-full" aria-hidden>
      <defs>
        <clipPath id="nf-sky">
          <rect width="240" height="96" />
        </clipPath>
      </defs>
      <g clipPath="url(#nf-sky)">
        <circle cx="120" cy="96" r="44" fill="var(--apricot)" />
        <circle cx="120" cy="96" r="30" fill="var(--peach)" />
      </g>
      <text x="120" y="91" textAnchor="middle" fontFamily="var(--font-display)" fontSize="24" fill="var(--on-btn)">
        404
      </text>
      <line x1="16" y1="96" x2="224" y2="96" stroke="var(--line)" strokeWidth="2" />
      <g stroke="var(--sea)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7">
        <path d="M70 110h100" />
        <path d="M88 122h64" opacity="0.7" />
        <path d="M104 134h32" opacity="0.5" />
      </g>
      <g stroke="var(--peach)" strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M96 104h48" />
        <path d="M108 116h24" />
      </g>
    </svg>
  );
}
