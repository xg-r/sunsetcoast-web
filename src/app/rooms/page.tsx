import { BookingDock } from '@/components/BookingDock';
import { CompareTray } from '@/components/CompareTray';
import { RoomCard } from '@/components/RoomCard';
import { RoomsBrowser } from '@/components/RoomsBrowser';
import { getSiteData } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

const data = getSiteData();
export const metadata = pageMeta(data, {
  title: '객실 · 제주 오션뷰 카라반 14동',
  description: `제주도 서귀포 바다 앞 오션뷰 카라반 ${data.rooms.filter((r) => r.visible).length}동, 애견동반 ${data.rooms.filter((r) => r.visible && r.petsAllowed).length}동. 스페이스카라반, 에어스트림, 스탠다드 중에서 반려견 동반, 인원으로 골라 보세요. 모든 카라반에 개별 화장실과 데크가 있어요.`,
  path: '/rooms/',
});

export default function RoomsPage() {
  const rooms = data.rooms.filter((r) => r.visible);
  return (
    <>
      <section className="wrap flex flex-col gap-6 pt-6">
        <div>
          <span className="eyebrow">our caravans</span>
          <h1 className="h2 mt-1">객실</h1>
          <p className="mt-2 text-[14px] text-mute">모든 카라반에 개별 화장실과 바베큐 데크가 있어요. 반려견과 함께라면 '반려견 동반'을 눌러 보세요. 마음에 드는 객실은 3개까지 담아 나란히 비교할 수 있어요.</p>
        </div>
        <RoomsBrowser
          tiers={data.tiers.map((t) => ({ key: t.key, name: t.name }))}
          items={rooms.map((r) => ({ slug: r.slug, tier: r.tierKey, pet: r.petsAllowed, max: r.guestsMax ?? 0, node: <RoomCard room={r} /> }))}
        />
      </section>
      <CompareTray names={Object.fromEntries(rooms.map((r) => [r.slug, r.name]))} />
      <BookingDock />
    </>
  );
}
