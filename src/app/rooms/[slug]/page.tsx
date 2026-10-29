import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingDock } from '@/components/BookingDock';
import { Gallery } from '@/components/Gallery';
import { Icon } from '@/components/Icon';
import { Photo } from '@/components/Photo';
import { ReviewCard, ReviewSource } from '@/components/ReviewCard';
import { RoomBadges, RoomCard } from '@/components/RoomCard';
import { getSiteData } from '@/lib/data';
import { amenitiesOf, CATEGORY_LABEL, coverOf, fromPrice, fromPriceLabel, guestsLabel, isEntryTier, relatedRooms, sizeLabel, won } from '@/lib/rooms';
import { breadcrumbJsonLd, jsonLd, pageMeta } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return getSiteData().rooms.filter((r) => r.visible).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getSiteData();
  const room = data.rooms.find((r) => r.slug === slug);
  if (!room) return {};
  const tier = data.tiers.find((t) => t.key === room.tierKey);
  const facts = [room.type !== tier?.name && room.type, guestsLabel(room) && `기준/최대 ${guestsLabel(room)}`, room.petsAllowed && '애견동반 가능', '개별 화장실'].filter(Boolean).join(' · ');
  // 제목: "제돌이 · 애견동반 에어스트림", 설명: 지역 키워드로 시작
  const title = `${room.name} · ${room.petsAllowed ? '애견동반 ' : ''}${tier?.name ?? '카라반'}`;
  const description = `제주 서귀포 바다 앞 ${tier?.name ?? '카라반'} ${room.name}. ${room.copy}. ${facts}`;
  return pageMeta(data, { title, description, path: `/rooms/${room.slug}/`, image: coverOf(room) ?? undefined });
}

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = getSiteData();
  const room = data.rooms.find((r) => r.slug === slug && r.visible);
  if (!room) notFound();

  const tier = data.tiers.find((t) => t.key === room.tierKey);
  const cover = coverOf(room);
  const price = fromPrice(data, room.slug);
  const rates = data.rateSeasons.map((s) => ({ s, rate: data.rates.find((x) => x.roomSlug === room.slug && x.seasonKey === s.key) }));
  const fee = { ...data.extraPersonFee, ...data.extraPersonFee.overrides[room.slug] };
  const pet = data.petPolicy;
  const reviews = data.reviews.filter((r) => r.roomSlug === room.slug).sort((a, b) => a.sortOrder - b.sortOrder);
  const items = room.images.map((img) => {
    const caption = img.caption ?? `${room.name} ${CATEGORY_LABEL[img.category]}`;
    return {
      category: img.category,
      caption,
      thumb: <Photo k={img.key} alt={img.alt ?? caption} sizes="(min-width:1024px) 30vw, (min-width:640px) 40vw, 78vw" />,
      full: <Photo k={img.key} alt={img.alt ?? caption} sizes="100vw" className="!object-contain" film={false} />,
    };
  });
  const facts = [
    ['users', guestsLabel(room), '기준/최대'],
    ['ruler', sizeLabel(room), room.sizeMm ? '길이 × 폭' : '크기'],
    ['bed', room.beds, '침대'],
    ['paw', room.petsAllowed ? '가능' : '불가', '반려견'],
  ] as const;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbJsonLd(data, [{ name: '객실', path: '/rooms/' }, { name: room.name, path: `/rooms/${room.slug}/` }]))} />
      {/* 1. 대표 사진 (화면 폭 전체, 헤더가 위에 겹침) */}
      <section className="relative -mt-[calc(3.5rem+env(safe-area-inset-top,0px))] aspect-[4/5] max-h-[78vh] w-full overflow-hidden bg-band md:aspect-[21/9]">
        {cover && <Photo k={cover} alt={`${room.name} 대표 사진`} priority sizes="100vw" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent via-30% to-black/70" />
        <div className="wrap absolute inset-x-0 bottom-0 flex flex-col gap-1.5 pb-6 text-[#fffaf3]">
          <span className="text-[12px] font-semibold text-[#ffd6c2]">{tier?.name}</span>
          <h1 className="font-display text-[2.25rem] leading-tight md:text-5xl">{room.name}</h1>
          <p className="text-[14px] opacity-90">{room.copy}</p>
          <RoomBadges room={room} light />
        </div>
      </section>

      {/* 2. 핵심 정보 4칸 — 모바일 첫 화면에서 스크롤 없이 보이게 */}
      <section className="wrap" aria-label="핵심 정보">
        <dl className="grid grid-cols-4 border-b border-line">
          {facts.map(([icon, value, label], i) => (
            <div key={label} className={`flex flex-col items-center gap-0.5 px-1 py-3 text-center ${i ? 'border-l border-line' : ''}`}>
              <Icon name={icon} className="size-5 text-coral" />
              <dt className="order-last text-[10.5px] text-mute">{label}</dt>
              <dd className={`text-[15px] font-bold leading-tight md:text-lg ${value ? '' : 'tbd'}`}>{value ?? '확인 중'}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 반려견 동반 객실이면 요금 규정을 사진보다 먼저 보여준다 (인스타 문의 대부분이 반려견 동반) */}
      {room.petsAllowed && (
        <section className="wrap mt-6" aria-labelledby="pet-title">
          <div className="flex flex-col gap-3 rounded-3xl bg-apricot/60 p-5">
            <div className="flex items-center gap-2">
              <Icon name="paw" className="size-5 text-coral" />
              <h2 id="pet-title" className="font-bold">반려견과 함께 묵을 수 있어요</h2>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              {pet.fees.map((f) => (
                <div key={f.condition} className="flex flex-col gap-0.5 rounded-2xl bg-surface px-1 py-2.5">
                  <dt className="text-[11.5px] text-mute">{f.condition}</dt>
                  <dd className="text-[13px] font-bold leading-snug">{f.fee}</dd>
                </div>
              ))}
            </dl>
            {pet.notes.length > 0 && (
              <ul className="flex flex-col gap-1 text-[13px]">
                {pet.notes.map((n) => (
                  <li key={n} className="flex gap-1.5"><Icon name="check" className="mt-[3px] size-4 text-coral" />{n}</li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* 3. 공간별 사진 */}
      <section className="mt-10 flex flex-col gap-3" aria-labelledby="gallery-title">
        <h2 id="gallery-title" className="h2 wrap">공간 둘러보기</h2>
        <Gallery items={items} />
      </section>

      <div className="wrap mt-4 grid gap-x-16 md:grid-cols-2">
        {/* 4. 이 객실의 이야기 */}
        {(room.nameStory || room.intro) && (
          <section className="mt-10 flex flex-col gap-3">
            <span className="eyebrow">our story</span>
            <h2 className="h2">{room.name}의 이야기</h2>
            {room.nameStory && <p className="text-[15px]">{room.nameStory}</p>}
            {room.intro && <p className="text-[15px] text-mute">{room.intro}</p>}
          </section>
        )}

        {/* 5. 시설 */}
        <section className="mt-10 flex flex-col gap-4">
          <h2 className="h2">시설</h2>
          <ul className="grid grid-cols-4 gap-x-1.5 gap-y-4">
            {amenitiesOf(data, room).map((a) => (
              <li key={a.key} className={`flex flex-col items-center gap-1.5 text-center text-[11.5px] leading-tight ${a.priority ? 'font-bold text-coral' : ''}`}>
                <Icon name={a.icon} className="size-6" />
                {a.name}
              </li>
            ))}
          </ul>
          {room.type && <p className="text-[13px] text-mute">객실 유형: {room.type}</p>}
        </section>

        {/* 6. 요금 */}
        <section className="mt-10 flex flex-col gap-3">
          <h2 className="h2">요금</h2>
          <table className="w-full text-sm tabular-nums">
            <tbody>
              {rates.map(({ s, rate }) => (
                <tr key={s.key} className="border-b border-line">
                  <th scope="row" className="py-2.5 text-left font-normal">
                    {s.name} <span className="text-xs text-mute">{s.description}</span>
                  </th>
                  <td className={`py-2.5 text-right ${rate ? 'font-bold' : 'tbd'}`}>{rate ? won(rate.price) : '준비 중'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.peakPeriods.length > 0 ? (
            <p className="text-[13px] text-mute">성수기: {data.peakPeriods.map((p) => `${p.start.slice(5).replace('-', '.')}~${p.end.slice(5).replace('-', '.')}`).join(', ')}</p>
          ) : (
            <p className="text-[13px] text-mute">성수기 기간은 예약 달력에서 확인해 주세요.</p>
          )}
          <p className="text-[13px] text-mute">
            기준 인원을 넘으면 성인 1인 {won(fee.adult)}, 아동 1인 {won(fee.child)}이에요. 24개월 미만은 {fee.infantFreeCount}명까지 무료예요.
            <br />
            실제 요금과 예약 가능 여부는 예약 페이지 기준이에요.
          </p>
        </section>

        {/* 7. 알아두세요 */}
        <section className="mt-10 flex flex-col gap-3">
          <h2 className="h2">알아두세요</h2>
          <ul className="flex flex-col gap-2.5 text-[14px]">
            <li className="flex gap-2.5"><Icon name="clock" className="mt-0.5 text-coral" />입실 {data.policies.checkIn}, 퇴실 {data.policies.checkOut}. {data.policies.checkInNote}</li>
            <li className="flex gap-2.5"><Icon name="grill" className="mt-0.5 text-coral" />바베큐와 큰 소리는 밤 11시까지예요.</li>
            {room.guestsMax && <li className="flex gap-2.5"><Icon name="users" className="mt-0.5 text-coral" />최대 {room.guestsMax}명을 넘으면 입실과 환불이 안 돼요.</li>}
            {room.petsAllowed && (
              <li className="flex gap-2.5">
                <Icon name="paw" className="mt-0.5 text-coral" />
                반려견과 함께 묵을 수 있어요. 요금은 위 안내를 확인해 주세요.
              </li>
            )}
          </ul>
          <Link href="/reservation/" className="flex items-center gap-1 self-start text-sm font-medium text-coral">
            이용 규정과 환불 규정 <Icon name="next" className="size-4" />
          </Link>
        </section>
      </div>

      {/* 이 객실 리뷰 (있을 때만) */}
      {reviews.length > 0 && (
        <section className="wrap mt-14 flex flex-col gap-4" aria-labelledby="room-review-title">
          <div>
            <span className="eyebrow">real reviews</span>
            <h2 id="room-review-title" className="h2 mt-1">{room.name}에 다녀간 분들의 이야기</h2>
          </div>
          <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => <li key={r.id}><ReviewCard review={r} showRoom={false} /></li>)}
          </ul>
          <ReviewSource />
        </section>
      )}

      {/* 8. 함께 보면 좋은 객실 */}
      <section className="wrap mt-14 flex flex-col gap-5">
        {isEntryTier(data, room.tierKey) ? (
          <div>
            <span className="eyebrow">a little more special</span>
            <h2 className="h2 mt-1">조금 더 특별한 하룻밤을 원한다면</h2>
            <p className="mt-2 text-[14px] text-mute">통창 너머 바다를 보는 스페이스카라반, 욕조에 몸을 담그는 에어스트림도 둘러보세요.</p>
          </div>
        ) : (
          <h2 className="h2">함께 보면 좋은 객실</h2>
        )}
        <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 md:mx-0 md:grid md:grid-cols-3 md:px-0">
          {relatedRooms(data, room).map((r) => (
            <div key={r.slug} className="w-[62%] shrink-0 snap-start md:w-auto">
              <RoomCard room={r} compare={false} />
            </div>
          ))}
        </div>
      </section>

      {/* 9. 하단 고정 바 */}
      <BookingDock
        room={room}
        note={
          <>
            <b className={`block text-sm ${price === null ? 'text-mute' : 'text-ink'}`}>{fromPriceLabel(price)}</b>
            {room.name}
          </>
        }
      />
    </>
  );
}
