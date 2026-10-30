import Link from 'next/link';
import { BookingDock } from '@/components/BookingDock';
import { Icon } from '@/components/Icon';
import { programLabel } from '@/components/MediaAppearances';
import { Photo } from '@/components/Photo';
import { PostCard } from '@/components/PostCard';
import { ReviewCard, ReviewSource } from '@/components/ReviewCard';
import { SunsetTime } from '@/components/SunsetTime';
import { getSiteData } from '@/lib/data';
import { activePosts, currentSeasonCard } from '@/lib/posts';
import { bookingFor, coverOf, firstSentence, fromPriceLabel, tierFromPrice } from '@/lib/rooms';
import { campgroundJsonLd, jsonLd, pageMeta } from '@/lib/seo';

export const metadata = { ...pageMeta(getSiteData(), { path: '/' }), title: { absolute: getSiteData().settings.seo.title } };

export default function HomePage() {
  const data = getSiteData();
  const { settings: s, tiers, rooms, services } = data;
  const booking = bookingFor(data);
  const pinned = activePosts(data).filter((p) => p.pinned && (p.kind === 'notice' || p.kind === 'event'));
  const dolphinNews = activePosts(data).filter((p) => p.kind === 'dolphin').slice(0, 3);
  const season = currentSeasonCard(data);
  const visible = rooms.filter((r) => r.visible);
  const petRooms = visible.filter((r) => r.petsAllowed);
  const airstreams = visible.filter((r) => r.tierKey === 'airstream');
  const [l1, l2] = s.heroCopy.split('\n');
  const insta = `https://www.instagram.com/${s.instagram}/`;
  const reviews = data.reviews.filter((r) => r.featured).sort((a, b) => a.sortOrder - b.sortOrder);
  const media = [...data.media].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(campgroundJsonLd(data))} />

      {/* 1. 대표 사진 + 오늘 노을 */}
      <section className="wrap grid items-end gap-7 pt-1 md:grid-cols-[1.15fr_1fr] md:gap-14 md:pt-6">
        <div className="relative -mx-2 aspect-[4/5] overflow-hidden rounded-[2rem] md:mx-0">
          <Photo k={s.heroImage} alt="해 질 녘 캠핑장의 카라반 너머로 지는 해" priority sizes="(min-width:768px) 55vw, 100vw" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent px-6 pb-7 pt-24 text-[#fffaf3]">
            <span className="font-script text-2xl text-[#ffd6c2]">Sunset coast, Jeju</span>
            <p className="mt-1 font-display text-[1.875rem] leading-snug md:text-[2.5rem]">
              {l1}
              {l2 && <br />}
              {l2}
            </p>
            <h1 className="mt-3 text-[13px] font-medium text-[#fffaf3]/85">제주 서귀포 애견동반 오션뷰 카라반 캠핑장, {s.name}</h1>
          </div>
        </div>
        <div className="flex flex-col gap-6 md:pb-6">
          <SunsetTime />
          <p className="max-w-md text-[15px] text-mute">
            제주 서귀포 영락리, 돌고래가 사는 바다 앞 카라반 {visible.length}동. 그중 {petRooms.length}동은 반려견과 함께 묵을 수 있어요.
          </p>
          <div className="flex flex-wrap gap-2">
            {booking.map((p, i) => (
              <a key={p.key} href={p.url} target="_blank" rel="noopener" className={`btn ${i ? 'btn-ghost' : 'btn-primary'}`} data-track="booking_click" data-platform={p.key} data-placement="hero">
                {p.label}
              </a>
            ))}
            <Link href="/rooms/?pet=1" className="btn btn-ghost">
              <Icon name="paw" className="size-4 text-coral" />
              반려견 동반 객실
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 안심 포인트 */}
      <section className="wrap mt-12" aria-label="안심 포인트">
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
          {[
            ['paw', `반려견 동반 ${petRooms.length}동`, '우리 아이도 가족이니까'],
            ['toilet', '개별 화장실', '카라반마다 따로 있어요'],
            ['grill', '개별 바베큐 데크', '우리끼리 오붓하게'],
            ['wave', '바다까지 1분', '돌고래 해변까지 걸어서'],
          ].map(([icon, title, sub]) => (
            <li key={title} className="flex items-center gap-3 rounded-3xl bg-band px-4 py-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface">
                <Icon name={icon} className="size-5 text-coral" />
              </span>
              <span className="flex min-w-0 flex-col">
                <b className="text-[14px] leading-tight">{title}</b>
                <span className="text-[12px] leading-snug text-mute">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
        {media.length > 0 && (
          <Link href="/about/#tv" className="mt-3 flex items-center gap-3 rounded-3xl border border-line px-4 py-3.5">
            <Icon name="tv" className="size-5 shrink-0 text-coral" />
            <span className="min-w-0 flex-1 text-[13.5px] leading-snug">
              <b>{media.map(programLabel).join(' · ')}</b>
              <span className="text-mute">에 나온 캠핑장이에요</span>
            </span>
            <Icon name="next" className="size-4 shrink-0 text-mute" />
          </Link>
        )}
      </section>

      {/* 3. 상단 고정 공지·이벤트 (있을 때만) */}
      {pinned.length > 0 && (
        <section className="wrap mt-10 flex flex-col gap-3" aria-label="공지">
          {pinned.map((p) => <PostCard key={p.id} post={p} compact />)}
        </section>
      )}

      {/* 4. 등급별 객실 — 무엇을 파는지 먼저. 스페이스카라반·에어스트림이 앞에 온다 */}
      <section className="wrap mt-20 flex flex-col gap-6">
        <div>
          <span className="eyebrow">our caravans</span>
          <h2 className="h2 mt-1">오늘은 어떤 카라반에서 잘까요?</h2>
        </div>
        <div className="grid gap-8 md:grid-cols-3 md:gap-5">
          {tiers.map((t) => {
            const list = visible.filter((r) => r.tierKey === t.key);
            const price = tierFromPrice(data, t.key);
            return (
              <Link key={t.key} href={`/rooms/?tier=${t.key}`} className="group flex flex-col gap-3">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-band md:aspect-[3/4]">
                  <Photo k={t.coverImage} alt={`${t.name} 객실`} sizes="(min-width:768px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="flex items-baseline justify-between gap-2 px-1">
                  <h3 className="font-display text-xl">
                    {t.name} <span className="font-sans text-sm text-mute">{list.length}동</span>
                  </h3>
                  <span className={price === null ? 'tbd text-[13px]' : 'text-[13px] font-bold'}>{fromPriceLabel(price)}</span>
                </div>
                <p className="-mt-2 px-1 text-[13px] text-mute">
                  {t.intro} · {list.map((r) => r.name).join(' · ')}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. 반려견과 함께 — 인스타 문의 대부분이 반려견 동반이라 객실 바로 다음 */}
      <section className="mt-20 flex flex-col gap-6" aria-labelledby="pet-title">
        <div className="wrap flex flex-col gap-2">
          <span className="eyebrow">with your dog</span>
          <h2 id="pet-title" className="h2">강아지와 함께 보는 노을</h2>
          <p className="max-w-xl text-[15px] text-mute">
            해안도로를 같이 걷고, 데크에서 같이 노을을 봐요. 반려견과 함께 묵을 수 있는 카라반이 {petRooms.length}동 있어요.
          </p>
        </div>
        <ul className="no-scrollbar wrap flex scroll-px-5 snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:grid-cols-3 md:gap-5 lg:grid-cols-6">
          {petRooms.map((r) => {
            const cover = coverOf(r);
            const tier = tiers.find((t) => t.key === r.tierKey);
            return (
              <li key={r.slug} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
                <Link href={`/rooms/${r.slug}/`} className="group flex flex-col gap-2">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-band">
                    {cover && <Photo k={cover} alt={`${r.name} 대표 사진`} sizes="(min-width:1024px) 16vw, (min-width:768px) 30vw, 44vw" className="transition-transform duration-500 group-hover:scale-[1.04]" />}
                    <span className="chip chip-key absolute left-2.5 top-2.5 !py-0.5">
                      <Icon name="paw" className="size-3.5" />
                      OK
                    </span>
                  </div>
                  <div className="px-1">
                    <b className="font-display text-[17px]">{r.name}</b>
                    <span className="ml-1.5 text-xs text-mute">{tier?.name}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="wrap">
          <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-7">
            <dl className="grid grid-cols-3 gap-2 text-center md:min-w-[28rem] md:text-left">
              {data.petPolicy.fees.map((f) => (
                <div key={f.condition} className="flex flex-col gap-0.5">
                  <dt className="text-[12px] text-mute">{f.condition}</dt>
                  <dd className="text-[14px] font-bold leading-snug">{f.fee}</dd>
                </div>
              ))}
            </dl>
            <div className="flex gap-2">
              <Link href="/rooms/?pet=1" className="btn btn-primary flex-1 md:flex-none">반려견 객실 보기</Link>
              <Link href="/reservation/#pet" className="btn btn-ghost flex-1 md:flex-none">동반 규정</Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. 즐길 거리 */}
      <section className="wrap mt-20 flex flex-col gap-4">
        <span className="eyebrow">slow days</span>
        <h2 className="h2">바다 앞에서 보내는 하루</h2>
        <ul className="grid gap-2 md:grid-cols-2 md:gap-4">
          {services.map((sv) => (
            <li key={sv.key} className="card flex gap-4 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-band">
                <Icon name={sv.icon} className="size-5 text-coral" />
              </span>
              <div>
                <b className="block">{sv.name}</b>
                <p className="mt-0.5 text-[13px] text-mute">
                  {sv.summary} {sv.price ? <span className="text-ink">{sv.price}</span> : <span className="tbd">요금 준비 중</span>}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {season && (
          <div className="flex flex-col gap-1 rounded-3xl bg-apricot/60 p-5">
            <span className="label">{season.label}</span>
            <b className="font-display text-lg">{season.card.title}</b>
            <p className="text-[13.5px] text-mute">{season.card.body}</p>
          </div>
        )}
        <Link href="/facilities/" className="flex items-center gap-1 self-start text-sm font-medium text-coral">
          시설과 서비스 자세히 <Icon name="next" className="size-4" />
        </Link>
      </section>

      {/* 7. 돌고래 이야기 */}
      <section className="wrap mt-20 grid gap-6 md:grid-cols-2 md:items-center md:gap-14">
        <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-band md:order-2">
          <Photo k="site/dolphin/dolphin-01" alt="청록색 바다를 헤엄치는 남방큰돌고래" sizes="(min-width:768px) 45vw, 100vw" />
        </div>
        <div className="flex flex-col gap-4">
          <span className="eyebrow">dolphins nearby</span>
          <h2 className="h2">운이 좋은 날엔, 창밖으로 돌고래</h2>
          <p className="text-[15px] text-mute">
            영락리 바다는 남방큰돌고래가 사는 곳이에요. 돌고래가 나타나는 해변까지 걸어서 1분. 에어스트림 {airstreams.length}동에는 제주 돌고래의 이름을 붙였어요.
          </p>
          <ul className="flex flex-col">
            {airstreams.map((r) => (
              <li key={r.slug} className="border-b border-line">
                <Link href={`/rooms/${r.slug}/`} className="flex gap-4 py-3 text-sm">
                  <b className="w-14 shrink-0 font-display text-base">{r.name}</b>
                  <span className="text-mute">{firstSentence(r.nameStory)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 8. 다녀간 분들의 리뷰 — 캠핑장 정보를 다 본 뒤 확신을 주는 자리. 반려견 동반 리뷰를 먼저, 위 등급 리뷰를 많이 */}
      {reviews.length > 0 && (
        <section className="mt-20 flex flex-col gap-5" aria-labelledby="review-title">
          <div className="wrap flex flex-col gap-1">
            <span className="eyebrow">real reviews</span>
            <h2 id="review-title" className="h2">다녀간 분들이 남긴 이야기</h2>
          </div>
          <ul className="no-scrollbar wrap flex scroll-px-5 snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4">
            {reviews.map((r) => (
              <li key={r.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] md:w-auto">
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
          <div className="wrap"><ReviewSource /></div>
        </section>
      )}

      {/* 9. 누구와 오세요? — 리뷰를 본 뒤 객실 고르기로 이어지게 */}
      <section className="wrap mt-20 flex flex-col gap-4">
        <h2 className="h2">누구와 함께 오세요?</h2>
        <div className="grid grid-cols-3 gap-2 md:max-w-2xl">
          {[
            ['paw', '반려견과', `${petRooms.length}동 가능`, '/rooms/?pet=1'],
            ['heart', '둘이서', '2명 객실', '/rooms/?guests=2'],
            ['child', '아이와 함께', '3~4명 객실', '/rooms/?guests=3-4'],
          ].map(([icon, title, sub, href]) => (
            <Link key={title} href={href} className="card flex flex-col items-center gap-1.5 px-1 py-5 text-center text-sm transition-colors hover:border-peach">
              <Icon name={icon} className="size-6 text-coral" />
              {title}
              <span className="text-[11px] text-mute">{sub}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 10. 인스타그램 — 방문자 대부분이 인스타에서 들어온다 */}
      <section className="wrap mt-20 flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="eyebrow">on instagram</span>
          <h2 className="h2">요즘의 선셋코스트</h2>
          <a href={insta} target="_blank" rel="noopener" className="flex items-center gap-1 text-[14px] text-mute" data-track="insta_click" data-placement="insta_handle">
            <Icon name="insta" className="size-4" />@{s.instagram}
          </a>
        </div>
        {dolphinNews.length > 0 && <div className="flex flex-col gap-3">{dolphinNews.map((p) => <PostCard key={p.id} post={p} compact />)}</div>}
        <a href={insta} target="_blank" rel="noopener" className="grid grid-cols-3 gap-1 overflow-hidden rounded-3xl md:grid-cols-6" aria-label="인스타그램에서 더 보기" data-track="insta_click" data-placement="insta_grid">
          {s.instagramPhotos.map((k) => (
            <div key={k} className="aspect-square overflow-hidden bg-band">
              <Photo k={k} alt="선셋코스트 사진" sizes="(min-width:768px) 16vw, 33vw" />
            </div>
          ))}
        </a>
        <a href={insta} target="_blank" rel="noopener" className="btn btn-ghost self-center" data-track="insta_click" data-placement="insta_follow">
          <Icon name="insta" className="size-4" />
          인스타그램 팔로우
        </a>
      </section>

      {/* 11. 오시는 길 요약 */}
      <section className="wrap mt-20 mb-6">
        <div className="card flex flex-col gap-3 p-5 md:p-7">
          <h2 className="h2">오시는 길</h2>
          <p className="flex items-start gap-2 text-[15px]">
            <Icon name="pin" className="mt-1 size-5 text-coral" />
            {s.address}
          </p>
          <p className="text-[13.5px] text-mute">
            입실 {data.policies.checkIn} · 퇴실 {data.policies.checkOut} · {data.policies.checkInNote}
          </p>
          <p className="text-[13.5px] text-mute">
            예약·문의 <a href={`tel:${s.phone.replaceAll('-', '')}`} className="text-ink underline underline-offset-2" data-track="call_click" data-placement="home_location">{s.phone}</a> ({s.phoneHours})
          </p>
          <Link href="/location/" className="flex items-center gap-1 self-start text-sm font-medium text-coral">
            길찾기와 주변 여행지 <Icon name="next" className="size-4" />
          </Link>
        </div>
      </section>

      <BookingDock />
    </>
  );
}
