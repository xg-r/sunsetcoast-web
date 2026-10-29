// 빌드 전에 백엔드에서 사이트 데이터를 받아 src/generated/site-data.json 에 저장한다: npm run data
// 계약: docs/api/site-data.md
//   SITE_DATA_API_URL 이 없으면 → 받아 둔 파일을 지우고 seed로 빌드한다 (로컬 개발)
//   있는데 실패하면 → 빌드를 멈춘다. 이전 배포가 그대로 남아서 사이트는 안전하다 (seed로 몰래 대체하지 않는다)
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
// next와 같은 .env.local을 읽는다. 이미 있는 환경 변수(CI 설정)는 덮어쓰지 않는다
try {
  process.loadEnvFile(path.join(ROOT, '.env.local'));
} catch {}
const OUT = path.join(ROOT, 'src', 'generated', 'site-data.json');
const BASE = (process.env.SITE_DATA_API_URL ?? '').replace(/\/$/, '');
const TOKEN = process.env.SITE_DATA_TOKEN ?? '';
const TIMEOUT_MS = 30_000;

if (!BASE) {
  fs.rmSync(OUT, { force: true });
  console.log('[site-data] SITE_DATA_API_URL 없음 → seed 데이터로 빌드');
  process.exit(0);
}

try {
  const r = await fetch(`${BASE}/site-data`, {
    headers: { accept: 'application/json', ...(TOKEN ? { authorization: `Bearer ${TOKEN}` } : {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  const problems = validate(data);
  if (problems.length) throw new Error(`응답이 계약과 다름\n  - ${problems.slice(0, 20).join('\n  - ')}`);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data));
  const rooms = data.rooms.filter((x) => x.visible).length;
  console.log(`[site-data] ${BASE}/site-data → 객실 ${rooms}동, 요금 ${data.rates.length}건, 리뷰 ${data.reviews.length}건`);
} catch (e) {
  console.error(`[site-data] 받기 실패: ${e.message}`);
  process.exit(1);
}

/** 화면이 깨질 만한 것만 검사한다. 필드 전체 정의는 src/lib/types.ts */
function validate(d) {
  const p = [];
  const arr = (k) => Array.isArray(d?.[k]) || p.push(`${k}: 배열이 아님`);
  if (!d || typeof d !== 'object') return ['본문이 객체가 아님'];
  if (!d.settings?.name || !d.settings?.siteUrl) p.push('settings.name, settings.siteUrl 필요');
  for (const k of ['tiers', 'rooms', 'amenities', 'rateSeasons', 'peakPeriods', 'rates', 'posts', 'reviews', 'faqs', 'services', 'commonFacilities', 'tours']) arr(k);
  for (const k of ['extraPersonFee', 'petPolicy', 'policies']) if (!d[k] || typeof d[k] !== 'object') p.push(`${k}: 객체가 아님`);
  if (p.length) return p;

  const tiers = new Set(d.tiers.map((t) => t.key));
  const slugs = new Set();
  for (const r of d.rooms) {
    if (!r.slug || !/^[a-z0-9-]+$/.test(r.slug)) p.push(`rooms: slug 형식 (${r.slug})`);
    if (slugs.has(r.slug)) p.push(`rooms: slug 중복 (${r.slug})`);
    slugs.add(r.slug);
    if (!r.name) p.push(`rooms.${r.slug}: name 없음`);
    if (!tiers.has(r.tierKey)) p.push(`rooms.${r.slug}: 없는 등급 (${r.tierKey})`);
    if (!Array.isArray(r.images)) p.push(`rooms.${r.slug}: images 배열 아님`);
    if (typeof r.visible !== 'boolean' || typeof r.petsAllowed !== 'boolean') p.push(`rooms.${r.slug}: visible·petsAllowed는 true/false`);
  }
  const seasons = new Set(d.rateSeasons.map((s) => s.key));
  for (const x of d.rates) {
    if (!slugs.has(x.roomSlug)) p.push(`rates: 없는 객실 (${x.roomSlug})`);
    if (!seasons.has(x.seasonKey)) p.push(`rates: 없는 요금 구분 (${x.seasonKey})`);
    if (!Number.isInteger(x.price) || x.price <= 0) p.push(`rates: 금액은 양의 정수 원 (${x.roomSlug} ${x.seasonKey})`);
  }
  // 리뷰에는 작성자를 알아볼 수 있는 정보가 오면 안 된다 (계약의 "리뷰 개인정보")
  const REVIEW_KEYS = new Set(['id', 'roomSlug', 'companion', 'visitedMonth', 'body', 'keywords', 'source', 'featured', 'sortOrder']);
  for (const v of d.reviews) {
    const extra = Object.keys(v).filter((k) => !REVIEW_KEYS.has(k));
    if (extra.length) p.push(`reviews.${v.id}: 허용하지 않는 필드 (${extra.join(', ')})`);
    if (!/^\d{4}-\d{2}$/.test(v.visitedMonth ?? '')) p.push(`reviews.${v.id}: visitedMonth는 YYYY-MM`);
    if (v.roomSlug !== null && !slugs.has(v.roomSlug)) p.push(`reviews.${v.id}: 없는 객실 (${v.roomSlug})`);
  }
  return p;
}
