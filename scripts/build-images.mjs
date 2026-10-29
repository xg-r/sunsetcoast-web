// photos/ 의 원본 사진으로 여러 크기의 AVIF/WebP와 OG 이미지(1200×630)를 만든다.
//
// - 출력: public/img/{key}.{hash}.{width}.{avif|webp}, public/og/{key}.{hash}.jpg
// - 목록: src/generated/images.json (페이지가 srcset을 만들 때 읽는다)
// - 파일명에 원본 내용의 해시가 들어가므로 CloudFront에서 1년 캐시해도 안전하고,
//   이미 만든 파일은 다시 만들지 않는다 (사진이 바뀐 것만 새로 인코딩).
//
// 4단계부터는 원본이 Supabase Storage에 있으므로, 빌드 전에 photos/ 로 내려받은 뒤 이 스크립트를 그대로 쓴다.
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'photos');
const OUT_IMG = path.join(ROOT, 'public', 'img');
const OUT_OG = path.join(ROOT, 'public', 'og');
const MANIFEST = path.join(ROOT, 'src', 'generated', 'images.json');

const WIDTHS = [480, 800, 1200, 1600];
const FORMATS = { avif: { quality: 55, effort: 4 }, webp: { quality: 76 } };
const OG_KEYS = /^(rooms\/[^/]+\/cover-01|site\/hero\/hero-01)$/;
const EXT = /\.(jpe?g|png|webp)$/i;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : EXT.test(e.name) ? [path.join(dir, e.name)] : [],
  );

async function pool(items, size, fn) {
  const queue = [...items];
  await Promise.all(Array.from({ length: size }, async () => {
    while (queue.length) await fn(queue.shift());
  }));
}

fs.mkdirSync(OUT_IMG, { recursive: true });
fs.mkdirSync(OUT_OG, { recursive: true });
fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });

const files = walk(SRC);
const manifest = {};
const keep = new Set();
let encoded = 0;

await pool(files, 4, async (abs) => {
  const key = path.relative(SRC, abs).split(path.sep).join('/').replace(EXT, '');
  const buf = fs.readFileSync(abs);
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const base = sharp(buf).rotate();
  const { width, height } = await base.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info);
  // 원본보다 큰 크기는 만들지 않고, 원본이 1600px보다 작으면 원본 폭을 마지막 크기로 쓴다.
  const widths = WIDTHS.filter((w) => w < width);
  widths.push(Math.min(width, WIDTHS.at(-1)));
  const outBase = path.join(OUT_IMG, key);
  fs.mkdirSync(path.dirname(outBase), { recursive: true });

  for (const w of widths) {
    for (const [fmt, opts] of Object.entries(FORMATS)) {
      const file = `${outBase}.${hash}.${w}.${fmt}`;
      keep.add(file);
      if (fs.existsSync(file)) continue;
      await base.clone().resize({ width: w, withoutEnlargement: true })[fmt](opts).toFile(file);
      encoded++;
    }
  }

  const lqip = await base.clone().resize(16).webp({ quality: 40 }).toBuffer();
  const entry = { w: width, h: height, hash, widths, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };

  if (OG_KEYS.test(key)) {
    const og = path.join(OUT_OG, `${key.replaceAll('/', '-')}.${hash}.jpg`);
    keep.add(og);
    if (!fs.existsSync(og)) {
      await base.clone().resize(1200, 630, { fit: 'cover', position: 'attention' }).jpeg({ quality: 82, mozjpeg: true }).toFile(og);
      encoded++;
    }
    entry.og = '/og/' + path.basename(og);
  }
  manifest[key] = entry;
});

// 원본이 바뀌거나 지워져 더 이상 쓰지 않는 파일을 정리한다.
let removed = 0;
for (const dir of [OUT_IMG, OUT_OG]) {
  for (const f of walk(dir)) if (!keep.has(f)) { fs.rmSync(f); removed++; }
}

const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 1));
console.log(`images: ${files.length} originals, ${encoded} encoded, ${removed} removed`);
