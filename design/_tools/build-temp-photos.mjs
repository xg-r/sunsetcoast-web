// manifest.json을 읽어 _raw 원본을 긴 변 1600px JPEG로 줄여 photos/ 에 규칙대로 복사한다.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('..', '..');
const raw = path.join(root, 'design', '_raw');
const out = path.join(root, 'photos');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const index = {};
for (const [dir, cats] of Object.entries(manifest)) {
  if (dir.startsWith('_')) continue;
  fs.mkdirSync(path.join(out, dir), { recursive: true });
  index[dir] = {};
  for (const [cat, srcs] of Object.entries(cats)) {
    index[dir][cat] = [];
    for (const [i, src] of srcs.entries()) {
      const name = `${cat}-${String(i + 1).padStart(2, '0')}.jpg`;
      const meta = await sharp(path.join(raw, src + '.jpg')).rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true }).toFile(path.join(out, dir, name));
      index[dir][cat].push({ file: `${dir}/${name}`, source: `sunsetcoast.kr/html/img/gallery/${src}.jpg`, w: meta.width, h: meta.height });
    }
  }
}
fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 2));
console.log('ok');
