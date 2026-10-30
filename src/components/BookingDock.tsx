// 모든 페이지 하단에 고정되는 "예약하기 · 전화하기" 바.
// 클릭 기록은 data-track 속성을 Analytics 컴포넌트가 읽어 보낸다 (객실 · 플랫폼 · 페이지).
import { getSiteData } from '@/lib/data';
import { bookingFor } from '@/lib/rooms';
import type { Room } from '@/lib/types';
import { Icon } from './Icon';
import { ShareButton } from './ShareButton';

export function BookingDock({ room, note }: { room?: Room; note?: React.ReactNode }) {
  const data = getSiteData();
  const s = data.settings;
  const platforms = bookingFor(data, room);
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="wrap flex items-center gap-2 py-2.5">
        <div className="min-w-0 flex-1 text-[11.5px] leading-snug text-mute">
          {note ?? (
            <>
              <b className="block text-sm text-ink">예약·문의</b>
              {s.phoneHours}
            </>
          )}
        </div>
        {room && <ShareButton title={`${room.name} | ${s.seo.title}`} text={room.copy} room={room.slug} />}
        {platforms.map((p, i) => (
          <a
            key={p.key}
            href={p.url}
            target="_blank"
            rel="noopener"
            className={`btn ${i === 0 ? 'btn-primary' : 'btn-ghost'} ${i > 0 ? 'max-[380px]:hidden' : ''}`}
            data-track="booking_click"
            data-platform={p.key}
            data-placement="dock"
            data-room={room?.slug ?? ''}
          >
            {p.label}
          </a>
        ))}
        <a
          href={`tel:${s.phone.replaceAll('-', '')}`}
          className="btn btn-ghost w-[2.875rem] px-0"
          aria-label={`전화하기 ${s.phone}, 상담 ${s.phoneHours}`}
          data-track="call_click"
          data-placement="dock"
          data-room={room?.slug ?? ''}
        >
          <Icon name="phone" />
        </a>
      </div>
    </div>
  );
}
