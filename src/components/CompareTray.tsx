'use client';

import Link from 'next/link';
import { useState } from 'react';
import { clearCompare, COMPARE_MAX, toggleCompare, useCompare } from './compare-store';
import { Icon } from './Icon';

export function CompareToggle({ slug, name }: { slug: string; name: string }) {
  const list = useCompare();
  const [full, setFull] = useState(false);
  const on = list.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => {
        const ok = toggleCompare(slug);
        setFull(!ok);
        if (!ok) setTimeout(() => setFull(false), 2000);
      }}
      className="flex min-h-10 items-center gap-1.5 self-start rounded-full border border-line px-3 text-[12.5px] aria-pressed:border-coral aria-pressed:text-coral"
    >
      <Icon name={on ? 'check' : 'plus'} className="size-4" />
      {full ? `비교는 ${COMPARE_MAX}개까지예요` : on ? `${name} 비교 담음` : '비교 담기'}
    </button>
  );
}

/** 비교함에 객실이 있으면 예약 바 위에 떠 있는 줄 */
export function CompareTray({ names }: { names: Record<string, string> }) {
  const list = useCompare().filter((s) => names[s]);
  if (!list.length) return null;
  return (
    <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] z-30 px-3">
      <div className="mx-auto flex max-w-xl items-center gap-2 rounded-2xl bg-ink py-2 pl-4 pr-2 text-bg shadow-lg">
        <span className="min-w-0 flex-1 truncate text-[13px]">
          비교 {list.length}/{COMPARE_MAX} · {list.map((s) => names[s]).join(', ')}
        </span>
        <button type="button" onClick={clearCompare} className="px-2 py-2 text-xs opacity-70">
          비우기
        </button>
        <Link href={`/rooms/compare/?r=${list.join(',')}`} className="btn btn-primary min-h-10 px-4 text-sm">
          비교하기
        </Link>
      </div>
    </div>
  );
}
