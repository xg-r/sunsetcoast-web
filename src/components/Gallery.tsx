'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PhotoCategory } from '@/lib/types';
import { CATEGORY_LABEL, GALLERY_TABS } from '@/lib/rooms';
import { Icon } from './Icon';

export interface GalleryItem {
  category: PhotoCategory;
  caption: string;
  thumb: React.ReactNode; // 서버에서 그린 <Photo> (이미지 목록 JSON을 브라우저 번들에 넣지 않기 위해)
  full: React.ReactNode;
}

/**
 * 공간별 사진 갤러리. 탭(전체 · 욕실 · 침실 …), 가로 스와이프, 전체 화면 라이트박스.
 * 욕실 탭은 항상 두 번째이고, 욕실 사진이 없으면 "욕실 사진 준비 중" 자리를 보여준다.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  const [cat, setCat] = useState<PhotoCategory | 'all'>('all');
  const [open, setOpen] = useState<number | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const it of items) c[it.category] = (c[it.category] ?? 0) + 1;
    return c;
  }, [items]);
  const tabs = GALLERY_TABS.filter((t) => t === 'all' || t === 'bath' || counts[t]);
  const shown = items.map((it, i) => ({ it, i })).filter(({ it }) => cat === 'all' || it.category === cat);
  const noBath = !counts.bath;

  const placeholder = (
    <div key="bath-ready" className="flex aspect-[4/5] w-[78%] shrink-0 snap-start flex-col items-center justify-center gap-2 rounded-3xl border-[1.5px] border-dashed border-line bg-surface p-6 text-center text-[13px] text-mute sm:w-[40%] lg:w-[30%]">
      <Icon name="camera" className="size-8 text-coral" />
      <b className="text-[15px] text-ink">욕실 사진 준비 중</b>
      이 객실에도 개별 화장실이 있어요.
      <br />
      사진은 곧 올라와요.
    </div>
  );

  const cards = shown.map(({ it, i }, n) => (
    <button
      key={i}
      type="button"
      onClick={() => setOpen(i)}
      className="flex w-[78%] shrink-0 cursor-zoom-in snap-start flex-col gap-1.5 text-left sm:w-[40%] lg:w-[30%]"
      aria-label={`${it.caption} 크게 보기`}
      data-first={n === 0 || undefined}
    >
      <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-band">{it.thumb}</div>
      <span className="text-[12.5px] text-mute">{it.caption}</span>
    </button>
  ));
  if (noBath && cat === 'all') cards.splice(1, 0, placeholder);
  if (noBath && cat === 'bath') cards.push(placeholder);

  return (
    <div className="flex flex-col gap-3">
      <div className="no-scrollbar wrap flex gap-1.5 overflow-x-auto" role="tablist" aria-label="사진 종류">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={cat === t}
            onClick={() => setCat(t)}
            className="shrink-0 rounded-full border border-line px-3 py-1.5 text-[13px] aria-selected:border-ink aria-selected:bg-ink aria-selected:text-bg"
          >
            {t === 'all' ? '전체' : CATEGORY_LABEL[t]}
            <span className="ml-1 text-[11px] opacity-60">{counts[t] ?? 0}</span>
          </button>
        ))}
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))] scroll-px-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))]">
        {cards}
      </div>
      {open !== null && <Lightbox items={items} start={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Lightbox({ items, start, onClose }: { items: GalleryItem[]; start: number; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(start);
  const [drag, setDrag] = useState(0);
  const startY = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    dialog.current?.showModal();
    const el = track.current!;
    el.scrollLeft = el.clientWidth * start;
  }, [start]);

  const go = (n: number) => {
    const el = track.current!;
    el.scrollTo({ left: el.clientWidth * Math.max(0, Math.min(items.length - 1, n)), behavior: 'smooth' });
  };

  // 아래로 끌어내리면 닫는다. 핀치 줌으로 확대한 상태에서는 동작하지 않는다.
  const zoomed = () => (window.visualViewport?.scale ?? 1) > 1.05;
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch' && !zoomed()) startY.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startY.current) return;
    const dy = e.clientY - startY.current.y;
    const dx = Math.abs(e.clientX - startY.current.x);
    if (dy > 0 && dy > dx) setDrag(dy);
  };
  const onPointerUp = () => {
    if (drag > 90) onClose();
    setDrag(0);
    startY.current = null;
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(idx + 1);
        if (e.key === 'ArrowLeft') go(idx - 1);
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-[#060a10] p-0 text-[#f4eee6] backdrop:bg-black/80"
      aria-label="사진 크게 보기"
      style={{ opacity: 1 - Math.min(drag / 400, 0.6) }}
    >
      <div className="flex h-full flex-col" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center justify-between px-4 pt-2 text-sm">
          <span className="tabular-nums">
            {idx + 1} / {items.length}
          </span>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center" aria-label="닫기" autoFocus>
            <Icon name="close" className="size-6" />
          </button>
        </div>
        <div
          ref={track}
          className="no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto"
          style={{ transform: `translateY(${drag}px)`, touchAction: 'pan-x pinch-zoom' }}
          onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {items.map((it, i) => (
            <figure key={i} className="flex h-full w-full shrink-0 snap-center items-center [&_img]:object-contain">
              {it.full}
            </figure>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 px-2 pb-4 pt-2 text-sm">
          <button type="button" onClick={() => go(idx - 1)} disabled={idx === 0} className="grid size-11 place-items-center disabled:opacity-30" aria-label="이전 사진">
            <Icon name="prev" className="size-6" />
          </button>
          <span className="text-center">{items[idx]?.caption}</span>
          <button type="button" onClick={() => go(idx + 1)} disabled={idx === items.length - 1} className="grid size-11 place-items-center disabled:opacity-30" aria-label="다음 사진">
            <Icon name="next" className="size-6" />
          </button>
        </div>
      </div>
    </dialog>
  );
}
