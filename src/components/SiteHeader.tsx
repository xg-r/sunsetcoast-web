'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MENU } from '@/lib/menu';
import { BrandMark } from './BrandMark';
import { Icon } from './Icon';

/** 객실 상세는 화면 폭 전체 사진 위에 헤더를 투명하게 겹쳐 놓는다 */
const OVERLAY = /^\/rooms\/(?!compare$)[^/]+$/;

// 주소는 끝에 / 가 없다 (trailingSlash: false). 혹시 붙어 와도 떼고 비교한다
const noSlash = (p: string) => (p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p);
const isCurrent = (path: string, href: string) => path === href || (href !== '/' && path.startsWith(href + '/'));

export type HeaderContact = { phone: string; phoneHours: string; instagram: string };

export function SiteHeader({ contact }: { contact: HeaderContact }) {
  const path = noSlash(usePathname());
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
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-colors ${overlay ? 'text-white' : open ? 'bg-bg text-ink' : 'bg-bg/90 text-ink backdrop-blur'}`}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="wrap flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-script text-[1.625rem] font-semibold leading-none" aria-label="선셋코스트 홈">
            <BrandMark className="size-7 shrink-0" />
            Sunset coast
          </Link>
          <nav className="hidden gap-1 text-sm md:flex" aria-label="주 메뉴">
            {MENU.slice(1).map((m) => (
              <Link key={m.href} href={m.href} aria-current={isCurrent(path, m.href) ? 'page' : undefined} className="rounded-full px-3 py-1.5 transition-colors hover:bg-band aria-[current=page]:bg-apricot aria-[current=page]:font-semibold">
                {m.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            className={`-mr-1.5 grid size-10 place-items-center rounded-full transition-colors md:hidden ${open ? 'bg-apricot' : ''}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? 'close' : 'menu'} className="size-6" />
          </button>
        </div>
      </header>

      {/*
        패널은 header 밖에 둔다. header의 backdrop-filter가 fixed 자식의 기준 상자가 되어
        패널이 헤더 높이(56px)로 잘리고 배경색이 사라지던 문제 때문.
      */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="주 메뉴"
          className="fixed inset-x-0 bottom-0 top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 flex flex-col overflow-y-auto border-t border-line bg-bg md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <ul className="wrap flex flex-col gap-2 pt-5">
            {MENU.map((m, i) => {
              const current = isCurrent(path, m.href);
              return (
                <li key={m.href} className="menu-in" style={{ animationDelay: `${i * 35}ms` }}>
                  <Link
                    href={m.href}
                    aria-current={current ? 'page' : undefined}
                    className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-4 py-3.5 transition-colors active:bg-band aria-[current=page]:border-apricot aria-[current=page]:bg-apricot"
                  >
                    <span className={`grid size-10 shrink-0 place-items-center rounded-full ${current ? 'bg-surface text-coral' : 'bg-band text-coral'}`}>
                      <Icon name={m.icon} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-display text-[1.1875rem] leading-snug">{m.label}</span>
                      <span className="font-script text-[0.9375rem] leading-tight text-mute">{m.en}</span>
                    </span>
                    <Icon name="next" className={`size-5 ${current ? 'text-coral' : 'text-mute'}`} />
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="wrap mt-auto pb-6 pt-8">
            <div className="rounded-3xl bg-band p-5">
              <span className="eyebrow">See you at sunset</span>
              <p className="mt-2 text-sm text-mute">
                예약·문의 <b className="text-ink">{contact.phone}</b>
                <br />
                {contact.phoneHours}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={`tel:${contact.phone.replaceAll('-', '')}`} className="btn btn-primary" data-track="call_click" data-placement="menu">
                  <Icon name="phone" className="size-4" />
                  전화하기
                </a>
                <a href={`https://www.instagram.com/${contact.instagram}/`} target="_blank" rel="noopener" className="btn btn-ghost" data-track="insta_click" data-placement="menu">
                  <Icon name="insta" className="size-4" />
                  인스타그램
                </a>
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
