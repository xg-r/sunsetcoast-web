import { BookingDock } from '@/components/BookingDock';
import { CompareView, type CompareRow } from '@/components/CompareView';
import { Photo } from '@/components/Photo';
import { getSiteData } from '@/lib/data';
import { coverOf, fromPrice, fromPriceLabel, guestsLabel, sizeLabel } from '@/lib/rooms';
import { pageMeta } from '@/lib/seo';

const data = getSiteData();
export const metadata = { ...pageMeta(data, { title: '객실 비교', path: '/rooms/compare/' }), robots: { index: false } };

export default function ComparePage() {
  const rows: CompareRow[] = data.rooms
    .filter((r) => r.visible)
    .map((r) => {
      const cover = coverOf(r);
      const bath = [r.privateToilet && '개별 화장실', r.shower && '샤워실', r.bathtub && '욕조'].filter(Boolean).join(' · ');
      return {
        slug: r.slug,
        name: r.name,
        thumb: cover ? <Photo k={cover} alt={`${r.name} 대표 사진`} sizes="33vw" /> : null,
        fields: {
          등급: data.tiers.find((t) => t.key === r.tierKey)?.name ?? null,
          크기: sizeLabel(r),
          '기준/최대': guestsLabel(r),
          침대: r.beds,
          욕실: bath || null,
          반려견: r.petsAllowed ? '가능' : '불가',
          요금: fromPrice(data, r.slug) === null ? null : fromPriceLabel(fromPrice(data, r.slug)),
        },
      };
    });
  return (
    <>
      <section className="wrap pt-6">
        <h1 className="h2">객실 비교</h1>
        <CompareView rows={rows} />
      </section>
      <BookingDock />
    </>
  );
}
