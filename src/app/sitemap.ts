import type { MetadataRoute } from 'next';
import { getSiteData } from '@/lib/data';
import { photoEntry } from '@/components/Photo';
import { coverOf } from '@/lib/rooms';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const data = getSiteData();
  const base = data.settings.siteUrl;
  const now = new Date();
  const pages = ['/', '/rooms/', '/facilities/', '/reservation/', '/news/', '/location/', '/about/'];
  return [
    ...pages.map((p) => ({ url: base + p, lastModified: now, priority: p === '/' ? 1 : 0.7 })),
    ...data.rooms.filter((r) => r.visible).map((r) => {
      // 대표 사진 + 객실 사진의 가장 큰 WebP (최대 10장)
      const keys = [coverOf(r), ...r.images.map((i) => i.key)].filter((k, i, a): k is string => !!k && a.indexOf(k) === i).slice(0, 10);
      const images = keys.flatMap((k) => {
        const e = photoEntry(k);
        return e ? [`${base}/img/${k}.${e.hash}.${e.widths.at(-1)}.webp`] : [];
      });
      return { url: `${base}/rooms/${r.slug}/`, lastModified: now, priority: 0.8, images };
    }),
  ];
}
