// 객실 관련 계산: 표시용 문자열, "~원부터", 필터, 함께 보면 좋은 객실.
import type { Amenity, BookingPlatform, PhotoCategory, Room, SiteData } from './types';

export const CATEGORY_LABEL: Record<PhotoCategory, string> = {
  cover: '대표', exterior: '외관', bedroom: '침실', bath: '욕실', kitchen: '주방', deck: '데크', view: '전망', pet: '반려견',
};

/** 갤러리 탭 순서. 욕실은 항상 두 번째 */
export const GALLERY_TABS: (PhotoCategory | 'all')[] = ['all', 'bath', 'bedroom', 'kitchen', 'deck', 'view', 'pet'];

/** 객실 이야기의 첫 문장(이름의 유래)만. 홈·소개 페이지의 짧은 목록용 */
export const firstSentence = (s: string | null) => s?.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? s ?? '';

export const won = (n: number) => n.toLocaleString('ko-KR') + '원';

export function sizeLabel(r: Room): string | null {
  if (r.sizeText) return r.sizeText;
  if (!r.sizeMm) return null;
  return `${r.sizeMm.length / 1000} × ${r.sizeMm.width / 1000}m`;
}

export const guestsLabel = (r: Room) =>
  r.guestsBase && r.guestsMax ? `${r.guestsBase}/${r.guestsMax}명` : null;

export function fromPrice(data: SiteData, slug: string): number | null {
  const prices = data.rates.filter((x) => x.roomSlug === slug).map((x) => x.price);
  return prices.length ? Math.min(...prices) : null;
}

export function tierFromPrice(data: SiteData, tierKey: string): number | null {
  const prices = data.rooms.filter((r) => r.tierKey === tierKey).map((r) => fromPrice(data, r.slug)).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}

export const fromPriceLabel = (p: number | null) => (p === null ? '요금 준비 중' : `${won(p)}부터`);

export function coverOf(r: Room): string | null {
  return r.images.find((i) => i.category === 'cover')?.key ?? r.images[0]?.key ?? null;
}

export const hasBathPhoto = (r: Room) => r.images.some((i) => i.category === 'bath');

/** 화장실·샤워·욕조를 맨 앞에 두고 나머지 시설을 붙인다 */
export function amenitiesOf(data: SiteData, r: Room): Amenity[] {
  const keys = [
    r.privateToilet && 'privateToilet',
    r.shower && 'shower',
    r.bathtub && 'bathtub',
    ...r.amenityKeys,
  ].filter((k): k is string => Boolean(k));
  return [...new Set(keys)].map((k) => data.amenities.find((a) => a.key === k)).filter((a): a is Amenity => Boolean(a));
}

/** 이 객실의 예약 버튼. 객실별 링크가 있으면 그것을, 없으면 기본 링크. 링크가 빈 플랫폼은 뺀다 */
export function bookingFor(data: SiteData, r?: Room): BookingPlatform[] {
  return data.settings.bookingPlatforms
    .map((p) => ({ ...p, url: r?.bookingLinks[p.key] || p.url }))
    .filter((p) => p.url);
}

/** 가장 아래 등급(sortOrder가 가장 큰 등급)인지. 이 등급은 이익이 적어서 위 등급으로 예약을 유도한다 */
export function isEntryTier(data: SiteData, tierKey: string): boolean {
  const last = [...data.tiers].sort((a, b) => b.sortOrder - a.sortOrder)[0];
  return last?.key === tierKey;
}

/** 같은 등급을 먼저, 그다음 같은 조건(반려견) 객실. 가장 아래 등급 객실에서는 위 등급을 먼저 보여준다 */
export function relatedRooms(data: SiteData, r: Room, n = 3): Room[] {
  const others = data.rooms.filter((x) => x.visible && x.slug !== r.slug);
  const upsell = isEntryTier(data, r.tierKey);
  const score = (x: Room) => ((upsell ? x.tierKey !== r.tierKey : x.tierKey === r.tierKey) ? 2 : 0) + (r.petsAllowed && x.petsAllowed ? 1.5 : 0);
  return others.sort((a, b) => score(b) - score(a) || a.sortOrder - b.sortOrder).slice(0, n);
}

export type GuestFilter = '2' | '3-4' | '';
export interface RoomFilter { tier: string; pet: boolean; guests: GuestFilter }

export function matchRoom(r: Room, f: RoomFilter): boolean {
  if (f.tier && r.tierKey !== f.tier) return false;
  if (f.pet && !r.petsAllowed) return false;
  if (f.guests === '3-4' && (r.guestsMax ?? 0) < 3) return false;
  return true;
}
