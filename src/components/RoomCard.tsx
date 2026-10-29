import Link from 'next/link';
import { getSiteData } from '@/lib/data';
import { coverOf, fromPrice, fromPriceLabel, guestsLabel } from '@/lib/rooms';
import type { Room } from '@/lib/types';
import { CompareToggle } from './CompareTray';
import { Icon } from './Icon';
import { Photo } from './Photo';

export function RoomBadges({ room, light = false }: { room: Room; light?: boolean }) {
  const chip = light ? 'chip border-white/40 bg-white/15 text-white' : 'chip';
  return (
    <div className="flex flex-wrap gap-1.5">
      {room.petsAllowed && (
        <span className="chip chip-key">
          <Icon name="paw" className="size-3.5" />
          반려견 동반
        </span>
      )}
      {room.privateToilet && (
        <span className={chip}>
          <Icon name="toilet" className="size-3.5" />
          개별 화장실
        </span>
      )}
      {room.view && <span className={chip}>{room.view}</span>}
    </div>
  );
}

export function RoomCard({ room, compare = true }: { room: Room; compare?: boolean }) {
  const data = getSiteData();
  const tier = data.tiers.find((t) => t.key === room.tierKey);
  const cover = coverOf(room);
  return (
    <article className="relative flex flex-col gap-2.5">
      <Link href={`/rooms/${room.slug}/`} className="group flex flex-col gap-2.5">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-band">
          {room.petsAllowed && (
            <span className="chip chip-key absolute left-3 top-3 z-10 !py-0.5">
              <Icon name="paw" className="size-3.5" />
              OK
            </span>
          )}
          {cover && (
            <Photo k={cover} alt={`${room.name} 대표 사진`} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw" className="transition-transform duration-500 group-hover:scale-[1.03]" />
          )}
        </div>
        <div className="flex items-baseline justify-between gap-2 px-1">
          <h3 className="font-display text-xl font-bold">{room.name}</h3>
          <span className="text-xs text-mute">{tier?.name}</span>
        </div>
        <p className="-mt-1.5 px-1 text-[13.5px] text-mute">{room.copy}</p>
      </Link>
      <RoomBadges room={room} />
      <div className="flex items-center justify-between gap-2 text-[13px]">
        <span className="flex items-center gap-1">
          <Icon name="users" className="size-4 text-coral" />
          기준/최대 <b>{guestsLabel(room) ?? '확인 중'}</b>
        </span>
        <span className={fromPrice(data, room.slug) === null ? 'tbd' : 'font-bold'}>{fromPriceLabel(fromPrice(data, room.slug))}</span>
      </div>
      {compare && <CompareToggle slug={room.slug} name={room.name} />}
    </article>
  );
}
