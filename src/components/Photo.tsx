// 빌드 때 만든 AVIF/WebP를 <picture> + srcset으로 내보낸다 (scripts/build-images.mjs).
// priority가 없으면 지연 로딩. film이면 옅은 필름 그레인을 얹는다 (globals.css .film).
// 로딩 전에는 16px 미리보기(lqip)를 배경으로 깔아 빈 칸이 보이지 않게 한다.
import images from '@/generated/images.json';

type Entry = { w: number; h: number; hash: string; widths: number[]; lqip: string; og?: string };
const MANIFEST = images as Record<string, Entry>;

export const photoEntry = (key: string): Entry | undefined => MANIFEST[key];
export const ogImage = (key: string): string | undefined => MANIFEST[key]?.og;

const srcset = (key: string, e: Entry, fmt: 'avif' | 'webp') =>
  e.widths.map((w) => `/img/${key}.${e.hash}.${w}.${fmt} ${w}w`).join(', ');

export function Photo({
  k,
  alt,
  sizes = '100vw',
  priority = false,
  className = '',
  film = true,
}: {
  k: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  film?: boolean;
}) {
  const e = MANIFEST[k];
  if (!e) return <div className={`bg-band ${className}`} role="img" aria-label={alt} />;
  const fallback = `/img/${k}.${e.hash}.${e.widths.find((w) => w >= 800) ?? e.widths.at(-1)}.webp`;
  return (
    <picture className={film ? 'film' : undefined}>
      <source type="image/avif" srcSet={srcset(k, e, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcset(k, e, 'webp')} sizes={sizes} />
      <img
        src={fallback}
        alt={alt}
        width={e.w}
        height={e.h}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding={priority ? 'sync' : 'async'}
        className={`block size-full object-cover ${className}`}
        style={{ backgroundImage: `url(${e.lqip})`, backgroundSize: 'cover' }}
      />
    </picture>
  );
}
