'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { COMPARE_MAX, toggleCompare } from './compare-store';

export interface CompareRow {
  slug: string;
  name: string;
  thumb: React.ReactNode;
  fields: Record<string, string | null>;
}

/** /rooms/compare/?r=nolmeong,suaegi,gorae — 링크로 공유해도 같은 비교가 열린다 */
export function CompareView({ rows }: { rows: CompareRow[] }) {
  const [slugs, setSlugs] = useState<string[] | null>(null);
  useEffect(() => {
    const r = new URLSearchParams(location.search).get('r') ?? '';
    setSlugs(r.split(',').filter((s) => rows.some((x) => x.slug === s)).slice(0, COMPARE_MAX));
  }, [rows]);

  if (slugs === null) return <p className="mt-6 text-sm text-mute">불러오는 중…</p>;
  const picked = slugs.map((s) => rows.find((x) => x.slug === s)!);
  if (!picked.length)
    return (
      <p className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-mute">
        비교할 객실이 없어요. <Link href="/rooms/" className="text-coral underline">객실 목록</Link>에서 &quot;비교 담기&quot;를 눌러 주세요.
      </p>
    );

  const keys = Object.keys(picked[0].fields);
  const remove = (slug: string) => {
    toggleCompare(slug);
    const next = slugs.filter((s) => s !== slug);
    setSlugs(next);
    history.replaceState(null, '', next.length ? `?r=${next.join(',')}` : location.pathname);
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[20rem] table-fixed text-[13px]">
        <thead>
          <tr>
            <th className="w-16" />
            {picked.map((r) => (
              <th key={r.slug} className="px-1 pb-3 align-top font-normal">
                <Link href={`/rooms/${r.slug}/`} className="flex flex-col gap-1.5">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl bg-band">{r.thumb}</div>
                  <b className="font-display text-base">{r.name}</b>
                </Link>
                <button type="button" onClick={() => remove(r.slug)} className="mt-1 text-xs text-mute underline">
                  빼기
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((k) => (
            <tr key={k} className="border-t border-line">
              <th scope="row" className="py-3 pr-2 text-left font-normal text-mute">{k}</th>
              {picked.map((r) => (
                <td key={r.slug} className={`px-1 py-3 text-center ${r.fields[k] ? 'font-medium' : 'tbd'}`}>
                  {r.fields[k] ?? '준비 중'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
