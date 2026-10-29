import type { Post, SeasonCard, SiteData } from './types';

// 빌드 시각 기준(한국 시간)으로 게시 기간 안의 글만 고른다. 기간이 지나면 다음 게시 때 사라진다.
const todayKst = () => new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

export const POST_KIND_LABEL: Record<Post['kind'], string> = { notice: '공지', event: '이벤트', dolphin: '돌고래 소식' };

export function activePosts(data: SiteData): Post[] {
  const t = todayKst();
  return data.posts
    .filter((p) => (!p.startsAt || p.startsAt <= t) && (!p.endsAt || p.endsAt >= t))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt));
}

const SEASONS: { key: SeasonCard['season']; label: string; months: number[] }[] = [
  { key: 'spring', label: '봄', months: [3, 4, 5] },
  { key: 'summer', label: '여름', months: [6, 7, 8] },
  { key: 'autumn', label: '가을', months: [9, 10, 11] },
  { key: 'winter', label: '겨울', months: [12, 1, 2] },
];

export function currentSeasonCard(data: SiteData) {
  const m = Number(todayKst().slice(5, 7));
  const season = SEASONS.find((s) => s.months.includes(m))!;
  const card = data.settings.seasonCards.find((c) => c.season === season.key);
  return card ? { label: season.label, card } : null;
}
