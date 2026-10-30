import Link from 'next/link';
import { getSiteData } from '@/lib/data';
import { naverPlaceUrl } from '@/lib/seo';
import type { Review } from '@/lib/types';
import { Icon } from './Icon';

/** 2026-10 → 2026년 10월 */
const monthLabel = (ym: string) => `${ym.slice(0, 4)}년 ${Number(ym.slice(5, 7))}월`;

/** 네이버 방문자 리뷰 한 개. 작성자 정보는 보여주지 않는다 (데이터에도 없음) */
export function ReviewCard({ review, showRoom = true }: { review: Review; showRoom?: boolean }) {
  const room = getSiteData().rooms.find((r) => r.slug === review.roomSlug && r.visible);
  return (
    <figure className="card flex h-full flex-col gap-3 p-5">
      <span className="text-[15px] tracking-[0.1em] text-peach" role="img" aria-label="별점 5점 만점에 5점">★★★★★</span>
      <blockquote className="flex-1 text-[14.5px] leading-relaxed">{review.body}</blockquote>
      <div className="flex flex-wrap gap-1.5">
        {review.keywords.map((k) => <span key={k} className="chip">{k}</span>)}
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-1.5 border-t border-line pt-3 text-[12.5px] text-mute">
        {showRoom && room && (
          <>
            <Link href={`/rooms/${room.slug}/`} className="font-semibold text-coral">{room.name}</Link>
            <span aria-hidden>·</span>
          </>
        )}
        <span>{review.companion}</span>
        <span aria-hidden>·</span>
        <span>{monthLabel(review.visitedMonth)} 방문</span>
      </figcaption>
    </figure>
  );
}

/** 리뷰 출처 안내 + 네이버 원문 링크 */
export function ReviewSource() {
  const url = naverPlaceUrl(getSiteData(), 'review');
  return (
    <div className="flex flex-col items-start gap-3">
      {url && (
        <a href={url} target="_blank" rel="noopener" className="btn btn-ghost" data-track="review_more_click">
          네이버에서 리뷰 더 보기
          <Icon name="next" className="size-4" />
        </a>
      )}
    </div>
  );
}
