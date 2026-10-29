import { BookingDock } from '@/components/BookingDock';
import { CopyButton } from '@/components/CopyButton';
import { Icon } from '@/components/Icon';
import { MapEmbed } from '@/components/MapEmbed';
import { getSiteData } from '@/lib/data';
import { naverPlaceUrl, pageMeta } from '@/lib/seo';

const data = getSiteData();
export const metadata = pageMeta(data, {
  title: '오시는 길',
  description: `${data.settings.address}. 제주 서남부 노을해안로, 돌고래가 나타나는 해변까지 걸어서 1분. 모슬포·송악산·산방산 등 주변 여행지 ${data.tours.length}곳.`,
  path: '/location/',
});

export default function LocationPage() {
  const s = data.settings;
  const q = encodeURIComponent(s.address);
  return (
    <>
      <section className="wrap flex flex-col gap-4 pt-6">
        <span className="eyebrow">find us</span>
        <h1 className="h2">오시는 길</h1>
        <div className="card flex items-center justify-between gap-3 p-4">
          <p className="flex gap-2 text-[15px]"><Icon name="pin" className="mt-0.5 text-coral" />{s.address}</p>
          <CopyButton text={s.address} label="주소 복사" />
        </div>
        <div className="grid grid-cols-2 gap-2 md:max-w-md">
          <a className="btn btn-ghost" href={naverPlaceUrl(data) ?? `https://map.naver.com/p/search/${q}`} target="_blank" rel="noopener" data-track="map_click" data-platform="naver">네이버 지도</a>
          <a className="btn btn-ghost" href={`https://map.kakao.com/link/search/${q}`} target="_blank" rel="noopener" data-track="map_click" data-platform="kakao">카카오맵</a>
        </div>
        <MapEmbed query="선셋코스트 카라반" lat={s.geo.lat} lng={s.geo.lng} />
        <p className="text-[13.5px] text-mute">
          입실 {data.policies.checkIn} · 퇴실 {data.policies.checkOut}. {data.policies.checkInNote} 문의 {s.phone} ({s.phoneHours})
        </p>
      </section>

      <section id="tour" className="wrap mt-14 flex scroll-mt-20 flex-col gap-4">
        <h2 className="h2">주변 여행지</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.tours.map((t, i) => (
            <li key={t.name} className={`flex items-center justify-between gap-3 rounded-3xl border p-4 ${i === 0 ? 'border-peach bg-surface' : 'border-line bg-surface'}`}>
              <div className="flex flex-col">
                <b className="text-[15px]">{t.name}</b>
                {t.note && <span className="text-xs text-mute">{t.note}</span>}
                {t.kidFriendly && <span className="chip mt-1 self-start">아이와 함께</span>}
              </div>
              <span className="shrink-0 text-[13px] text-mute tabular-nums">{t.distance}</span>
            </li>
          ))}
        </ul>
      </section>
      <BookingDock />
    </>
  );
}
