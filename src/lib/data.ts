// 빌드 시점에 사이트 데이터를 읽는 유일한 입구. 데이터 원본은 src/lib/seed 다 (DB 없음, 코드에서 관리).
// 방문자 브라우저는 이 데이터를 HTML로만 받는다.
import images from '@/generated/images.json';
import { CAPTIONS, SEED } from './seed';
import type { PhotoCategory, Room, RoomImage, SiteData } from './types';

const CATEGORY_ORDER: PhotoCategory[] = ['cover', 'bath', 'bedroom', 'kitchen', 'deck', 'view', 'exterior', 'pet'];

function roomImagesFromPhotos(slug: string): RoomImage[] {
  const prefix = `rooms/${slug}/`;
  return Object.keys(images)
    .filter((k) => k.startsWith(prefix))
    .map((key) => {
      const [cat, n] = key.slice(prefix.length).split('-') as [PhotoCategory, string];
      const caption = CAPTIONS[key] ?? null;
      return { key, category: cat, caption, alt: caption, sortOrder: CATEGORY_ORDER.indexOf(cat) * 100 + Number(n) };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** seed에 객실 사진 목록 같은 계산 값을 채워 화면이 쓰는 모양으로 만든다 */
function seedSiteData(): SiteData {
  const rooms: Room[] = SEED.rooms.map((r, i) => ({
    ...r,
    privateToilet: true, // 모든 카라반에 개별 화장실 (운영자 확인)
    bookingLinks: {},
    externalIds: {},
    visible: true,
    sortOrder: i + 1,
    images: roomImagesFromPhotos(r.slug),
  }));
  return { ...SEED, rooms };
}

let cache: SiteData | null = null;

export function getSiteData(): SiteData {
  return (cache ??= seedSiteData());
}
