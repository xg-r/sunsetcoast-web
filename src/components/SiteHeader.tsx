'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MENU } from '@/lib/menu';
import { Icon } from './Icon';

/** 객실 상세는 화면 폭 전체 사진 위에 헤더를 투명하게 겹쳐 놓는다 */
const OVERLAY = /^\/rooms\/(?!compare\/)[^/]+\/$/;

// trailingSlash 설정과 관계없이 끝에 / 를 붙여 비교한다
const withSlash = (p: string) => (p.endsWith('/') ? p : p + '/');

export function SiteHeader() {
  const path = withSlash(usePathname());
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlay = OVERLAY.test(path) && !scrolled && !open;

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors ${overlay ? 'text-white' : 'bg-bg/90 text-ink backdrop-blur'}`}
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="wrap flex h-14 items-center justify-between">
        <Link href="/" className="font-script text-[1.625rem] font-semibold leading-none" aria-label="선셋코스트 홈">
          Sunset coast
        </Link>
        <nav className="hidden gap-1 text-sm md:flex" aria-label="주 메뉴">
          {MENU.slice(1).map((m) => (
            <Link key={m.href} href={m.href} aria-current={path.startsWith(m.href) ? 'page' : undefined} className="rounded-full px-3 py-1.5 transition-colors hover:bg-band aria-[current=page]:bg-apricot aria-[current=page]:font-semibold">
              {m.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="-mr-2 grid size-11 place-items-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'close' : 'menu'} className="size-6" />
        </button>
      </div>
      {open && (
        <nav id="mobile-menu" aria-label="주 메뉴" className="fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 bg-bg md:hidden">
          <ul className="wrap flex flex-col pt-4">
            {MENU.map((m) => (
              <li key={m.href} className="border-b border-line">
                <Link href={m.href} className="flex items-center justify-between py-4 font-display text-[1.375rem]">
                  {m.label}
                  <Icon name="next" className="size-5 text-mute" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
