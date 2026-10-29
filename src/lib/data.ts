// 빌드 시점에 사이트 데이터를 읽는 유일한 입구.
// 백엔드 API가 설정돼 있으면 scripts/fetch-site-data.mjs가 빌드 전에 받아 둔 src/generated/site-data.json을 읽고,
// 없으면 seed를 쓴다. 계약: docs/api/site-data.md
// 방문자 브라우저는 이 데이터를 HTML로만 받으므로 DB나 백엔드를 직접 호출하지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import images from '@/generated/images.json';
import { CAPTIONS, SEED } from './seed';
import type { PhotoCategory, Room, RoomImage, SiteData } from './types';

const API_FILE = path.join(process.cwd(), 'src', 'generated', 'site-data.json');

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

/** seed를 API 응답과 같은 모양으로 만든다 (scripts/export-seed.mjs가 목 데이터를 만들 때도 쓴다) */
export function seedSiteData(): SiteData {
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
  if (cache) return cache;
  cache = fs.existsSync(API_FILE) ? (JSON.parse(fs.readFileSync(API_FILE, 'utf8')) as SiteData) : seedSiteData();
  return cache;
}
