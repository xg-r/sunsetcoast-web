// 사이트 데이터 타입. 원본은 src/lib/seed.
// 값이 아직 없으면 null — 화면은 null을 "준비 중"으로 표시하고 지어낸 값을 넣지 않는다.

export type PhotoCategory = 'cover' | 'exterior' | 'bedroom' | 'bath' | 'kitchen' | 'deck' | 'view' | 'pet';

/** room_tiers */
export interface RoomTier {
  key: string; // URL용 (?tier=airstream)
  name: string;
  intro: string;
  coverImage: string; // photos/ 기준 key
  sortOrder: number;
}

/** room_images */
export interface RoomImage {
  key: string; // photos/ 기준 key, 예: rooms/suaegi/bath-01
  category: PhotoCategory;
  caption: string | null;
  alt: string | null; // 비어 있으면 캡션으로 채운다
  sortOrder: number;
}

/** rooms */
export interface Room {
  slug: string;
  name: string;
  tierKey: string;
  copy: string; // 한 줄 카피
  nameStory: string | null; // 이름 이야기
  intro: string | null;
  type: string | null; // 유형 (예: 오션뷰 스페이스카라반)
  sizeMm: { length: number; width: number } | null;
  sizeText: string | null; // mm 대신 평·㎡로 표시할 때 (에어스트림)
  beds: string | null;
  guestsBase: number | null;
  guestsMax: number | null;
  view: string | null;
  petsAllowed: boolean;
  privateToilet: boolean;
  shower: boolean | null; // null = 확인 전
  bathtub: boolean | null;
  amenityKeys: string[];
  bookingLinks: Partial<Record<string, string>>; // 플랫폼 key → 객실별 링크. 없으면 기본 링크
  externalIds: Partial<Record<string, string>>; // 플랫폼별 객실 ID (향후 연동용)
  visible: boolean;
  sortOrder: number;
  images: RoomImage[];
}

/** amenities */
export interface Amenity {
  key: string;
  name: string;
  icon: string; // components/Icon.tsx 의 이름
  priority?: boolean; // 화장실·샤워처럼 맨 앞에 강조
}

/** rate_seasons */
export interface RateSeason {
  key: 'offWeekday' | 'offWeekend' | 'peakWeekday' | 'peakWeekend' | string;
  name: string;
  description: string;
  sortOrder: number;
}

/** rate_seasons 중 성수기의 기간 */
export interface PeakPeriod {
  start: string; // YYYY-MM-DD
  end: string;
  label: string | null;
}

/** room_rates */
export interface RoomRate {
  roomSlug: string;
  seasonKey: string;
  price: number; // 원
}

/** 추가 인원 요금 (전역 설정 + 객실별 예외) */
export interface ExtraPersonFee {
  adult: number;
  child: number;
  infantFreeCount: number; // 24개월 미만 무료 인원
  overrides: Record<string, { adult?: number; child?: number }>;
}

/** pet_policy — 조건별 요금 표 (예: 10kg 미만 → 2마리까지 무료) */
export interface PetPolicy {
  fees: { condition: string; fee: string }[];
  notes: string[];
}

/** posts */
export interface Post {
  id: string;
  kind: 'notice' | 'event' | 'dolphin';
  title: string;
  body: string;
  image: string | null;
  pinned: boolean;
  publishedAt: string; // YYYY-MM-DD
  startsAt: string | null;
  endsAt: string | null;
}

/**
 * reviews — 네이버 방문자 리뷰를 운영자가 골라 옮긴 것.
 * 작성자를 알아볼 수 있는 정보(닉네임, 프로필, 리뷰·사진 수, 방문 횟수, 정확한 방문일, 인증 수단)는 저장하지 않는다.
 * 본문은 맞춤법만 다듬고, 필요하면 일부만 옮긴다 (뜻은 바꾸지 않는다).
 */
export interface Review {
  id: string;
  roomSlug: string | null; // 객실을 알 수 없으면 null
  companion: string; // 함께 간 사람 (예: 연인 · 반려견)
  visitedMonth: string; // YYYY-MM (일까지는 저장하지 않는다)
  body: string;
  keywords: string[]; // 리뷰에서 고른 키워드 (최대 3개)
  source: 'naver';
  featured: boolean; // 홈에 보여줄지
  sortOrder: number;
}

/**
 * media — 캠핑장이 나온 방송.
 * 방송 캡처는 저작권 때문에 쓰지 않는다. 영상은 방송사·제작사 공식 유튜브만 넣는다 (사이트 안에서 재생).
 */
export interface MediaAppearance {
  id: string;
  broadcaster: string; // JTBC
  program: string; // 끝사랑
  episode: string | null; // 8회
  airedAt: string; // YYYY-MM-DD
  summary: string;
  youtubeId: string | null; // 공식 채널 영상 ID (watch?v= 뒤 11자)
  sortOrder: number;
}

/** policies */
export interface Policies {
  checkIn: string;
  checkInNote: string;
  checkOut: string;
  rules: string[];
  refund: { when: string; fee: string }[];
  refundNotes: string[];
}

export interface Faq {
  q: string;
  a: string;
}

/** services */
export interface Service {
  key: string;
  name: string;
  icon: string;
  summary: string;
  howTo: string[];
  price: string | null;
  image: string | null;
}

/** tours */
export interface Tour {
  name: string;
  distance: string;
  note: string | null;
  kidFriendly: boolean;
}

/** site_settings.booking_platforms — 배열 순서대로 버튼이 나온다. url이 빈 플랫폼은 버튼을 숨긴다 */
export interface BookingPlatform {
  key: string;
  label: string;
  url: string;
}

export interface SeasonCard {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  title: string;
  body: string;
  image: string | null;
}

/** site_settings */
export interface SiteSettings {
  name: string;
  nameEn: string;
  siteUrl: string;
  address: string;
  beachAddress: string;
  geo: { lat: number; lng: number };
  owner: string;
  businessNo: string;
  phone: string;
  phoneHours: string;
  bankAccount: { bank: string; number: string; holder: string };
  instagram: string;
  naverPlaceId: string | null; // 네이버 플레이스 번호 (지도·리뷰 링크, 구조화 데이터)
  instagramPhotos: string[];
  partner: { name: string; url: string | null };
  bookingPlatforms: BookingPlatform[];
  heroImage: string;
  heroCopy: string;
  seo: { title: string; description: string; naverVerification: string };
  analyticsId: string | null;
  seasonCards: SeasonCard[];
}

export interface SiteData {
  settings: SiteSettings;
  tiers: RoomTier[];
  rooms: Room[];
  amenities: Amenity[];
  rateSeasons: RateSeason[];
  peakPeriods: PeakPeriod[];
  rates: RoomRate[];
  extraPersonFee: ExtraPersonFee;
  petPolicy: PetPolicy;
  posts: Post[];
  reviews: Review[];
  media: MediaAppearance[];
  policies: Policies;
  faqs: Faq[];
  services: Service[];
  commonFacilities: string[];
  tours: Tour[];
}
