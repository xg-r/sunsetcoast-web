import { BookingDock } from '@/components/BookingDock';
import { Icon } from '@/components/Icon';
import { Photo } from '@/components/Photo';
import { getSiteData } from '@/lib/data';
import { pageMeta } from '@/lib/seo';

const data = getSiteData();
export const metadata = pageMeta(data, {
  title: '시설과 서비스',
  description: '제주 선셋코스트 캠핑장 시설. 카라반마다 개별 바베큐 데크, 투숙객 2시간 무료 브롬톤 자전거, 공용 샤워실·세탁실·취사장.',
  path: '/facilities/',
  image: 'site/facility/bbq-01',
});

export default function FacilitiesPage() {
  return (
    <>
      <section className="wrap flex flex-col gap-3 pt-6">
        <span className="eyebrow">slow days</span>
        <h1 className="h2">시설과 서비스</h1>
        <p className="text-[14px] text-mute">카라반마다 화장실과 데크가 있고, 공용 시설도 따로 운영해요. 바다 앞에서 느긋하게 머물다 가세요.</p>
      </section>

      <div className="wrap mt-8 flex flex-col gap-12">
        {data.services.map((sv) => (
          <section key={sv.key} id={sv.key} className="grid scroll-mt-20 gap-5 md:grid-cols-2 md:items-center md:gap-12">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-band">
              {sv.image ? <Photo k={sv.image} alt={sv.name} sizes="(min-width:768px) 45vw, 100vw" /> : <Icon name={sv.icon} className="size-14 text-coral" />}
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="h2">{sv.name}</h2>
              <p className="text-[15px]">{sv.summary}</p>
              <ul className="flex flex-col gap-1.5 text-[14px] text-mute">
                {sv.howTo.map((h) => (
                  <li key={h} className="flex gap-2"><Icon name="check" className="mt-1 size-4 text-coral" />{h}</li>
                ))}
              </ul>
              <p className="text-[15px]">
                요금 {sv.price ? <b>{sv.price}</b> : <span className="tbd">준비 중</span>}
              </p>
            </div>
          </section>
        ))}

        <section id="common" className="scroll-mt-20 flex flex-col gap-4">
          <h2 className="h2">공용 시설</h2>
          <p className="text-[14px] text-mute">모든 카라반에 개별 화장실이 있고, 아래 공용 시설도 함께 쓸 수 있어요.</p>
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {data.commonFacilities.map((f) => (
              <li key={f} className="card px-4 py-4 text-sm">{f}</li>
            ))}
          </ul>
        </section>

        <section id="safety" className="scroll-mt-20 flex flex-col gap-3">
          <h2 className="h2">안전</h2>
          <ul className="flex flex-col gap-2 text-[14px]">
            <li className="flex gap-2"><Icon name="shield" className="mt-0.5 text-coral" />긴급대피소를 운영해요.</li>
            <li className="flex gap-2"><Icon name="ext" className="mt-0.5 text-coral" />에어스트림 객실에는 소화기와 화재경보기가 있어요.</li>
            <li className="flex gap-2"><Icon name="flame" className="mt-0.5 text-coral" />객실 안에서는 불을 쓸 수 없고, 바베큐는 개별 데크에서만 해요.</li>
          </ul>
        </section>
      </div>
      <BookingDock />
    </>
  );
}
