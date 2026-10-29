import Link from 'next/link';
import { BookingDock } from '@/components/BookingDock';
import { Photo } from '@/components/Photo';
import { getSiteData } from '@/lib/data';
import { firstSentence } from '@/lib/rooms';
import { pageMeta } from '@/lib/seo';

const data = getSiteData();
export const metadata = pageMeta(data, {
  title: '선셋코스트 이야기',
  description: '제주 서귀포 영락리, 남방큰돌고래가 사는 바다 앞 카라반 캠핑장. 돌고래 이름을 단 에어스트림과 쉬는 방법을 담은 스페이스카라반 이야기.',
  path: '/about/',
  image: 'site/hero/hero-01',
});

// 기존 /html/sub1_view.html(풍경) 페이지를 받는 자리. 메뉴에는 없고 홈의 "돌고래 이야기"와 같은 내용을 길게 보여준다.
export default function AboutPage() {
  const airstreams = data.rooms.filter((r) => r.tierKey === 'airstream' && r.visible);
  const premium = data.rooms.filter((r) => r.tierKey === 'premium' && r.visible);
  return (
    <>
      <section className="wrap flex flex-col gap-4 pt-6">
        <span className="eyebrow">our story</span>
        <h1 className="h2">노을이 머무는 바다 앞, 우리만의 작은 집</h1>
        <p className="max-w-2xl text-[15px] text-mute">
          선셋코스트는 제주 서귀포 대정읍 영락리 바다 앞에 있어요. 남방큰돌고래가 사는 바다이고, 돌고래가 나타나는 해변까지 걸어서 1분이에요. 캠핑의 낭만은 그대로 두고, 불편함은 줄였어요. 모든 카라반에 개별 화장실과 데크가 있고, 반려견과 함께 묵는 카라반도 있어요.
        </p>
      </section>
      <section className="wrap mt-8 grid grid-cols-2 gap-2 md:grid-cols-4">
        {['site/hero/hero-02', 'site/dolphin/dolphin-04', 'site/night/night-02', 'site/hero/hero-03'].map((k) => (
          <div key={k} className="aspect-[4/5] overflow-hidden rounded-3xl bg-band"><Photo k={k} alt="선셋코스트 풍경" sizes="(min-width:768px) 25vw, 50vw" /></div>
        ))}
      </section>
      <section className="wrap mt-12 grid gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="h2">돌고래의 이름을 단 에어스트림</h2>
          <ul className="flex flex-col">
            {airstreams.map((r) => (
              <li key={r.slug} className="border-b border-line py-3 text-sm">
                <Link href={`/rooms/${r.slug}/`} className="font-display text-base font-bold">{r.name}</Link>
                <p className="text-mute">{firstSentence(r.nameStory)}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="h2">쉬는 방법을 담은 &quot;멍&quot;</h2>
          <ul className="flex flex-col">
            {premium.map((r) => (
              <li key={r.slug} className="border-b border-line py-3 text-sm">
                <Link href={`/rooms/${r.slug}/`} className="font-display text-base font-bold">{r.name}</Link>
                <p className="text-mute">{firstSentence(r.nameStory)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <BookingDock />
    </>
  );
}
