'use client';

import { useEffect, useState } from 'react';
import type { GuestFilter, RoomFilter } from '@/lib/rooms';

export interface BrowserItem {
  slug: string;
  tier: string;
  pet: boolean;
  max: number;
  node: React.ReactNode; // 서버에서 그린 RoomCard
}

const parse = (q: URLSearchParams): RoomFilter => ({
  tier: q.get('tier') ?? '',
  pet: q.get('pet') === '1',
  guests: (['2', '3-4'].includes(q.get('guests') ?? '') ? q.get('guests') : '') as GuestFilter,
});

/**
 * 객실 목록 필터. 상태를 URL 쿼리(?tier=&pet=1&guests=3-4)에 남겨서 카카오톡으로 링크를 보내도 같은 목록이 열린다.
 * 정적 HTML에는 14개 카드가 모두 들어 있고(검색엔진·JS 없는 환경), 브라우저에서 조건에 맞지 않는 카드만 숨긴다.
 */
export function RoomsBrowser({ items, tiers }: { items: BrowserItem[]; tiers: { key: string; name: string }[] }) {
  const [f, setF] = useState<RoomFilter>({ tier: '', pet: false, guests: '' });

  useEffect(() => {
    const sync = () => setF(parse(new URLSearchParams(location.search)));
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  function update(next: Partial<RoomFilter>) {
    const v = { ...f, ...next };
    setF(v);
    const q = new URLSearchParams();
    if (v.tier) q.set('tier', v.tier);
    if (v.pet) q.set('pet', '1');
    if (v.guests) q.set('guests', v.guests);
    history.replaceState(null, '', q.size ? `?${q}` : location.pathname);
  }

  const match = (it: BrowserItem) =>
    (!f.tier || it.tier === f.tier) && (!f.pet || it.pet) && (f.guests !== '3-4' || it.max >= 3);
  const count = items.filter(match).length;

  const chip = 'shrink-0 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px] aria-pressed:border-apricot aria-pressed:bg-apricot aria-pressed:font-semibold';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5" role="group" aria-label="등급">
          <button type="button" className={chip} aria-pressed={!f.tier} onClick={() => update({ tier: '' })}>전체 등급</button>
          {tiers.map((t) => (
            <button key={t.key} type="button" className={chip} aria-pressed={f.tier === t.key} onClick={() => update({ tier: f.tier === t.key ? '' : t.key })}>
              {t.name}
            </button>
          ))}
        </div>
        <div className="no-scrollbar -mx-5 flex gap-1.5 overflow-x-auto px-5" role="group" aria-label="인원과 반려견">
          <button type="button" className={chip} aria-pressed={f.pet} onClick={() => update({ pet: !f.pet })}>반려견 동반</button>
          <button type="button" className={chip} aria-pressed={f.guests === '2'} onClick={() => update({ guests: f.guests === '2' ? '' : '2' })}>2명</button>
          <button type="button" className={chip} aria-pressed={f.guests === '3-4'} onClick={() => update({ guests: f.guests === '3-4' ? '' : '3-4' })}>3~4명</button>
        </div>
        <p className="text-[13px] text-mute" aria-live="polite">객실 {count}개</p>
      </div>
      <ul className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li key={it.slug} hidden={!match(it)}>{it.node}</li>
        ))}
      </ul>
      {count === 0 && (
        <p className="rounded-3xl border border-dashed border-line p-8 text-center text-sm text-mute">
          조건에 꼭 맞는 객실이 없어요. 조건을 하나 풀어 볼까요?
        </p>
      )}
    </div>
  );
}
