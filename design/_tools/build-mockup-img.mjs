// 시안 페이지용으로 photos/ 일부를 긴 변 900px로 줄여 design/mockup/img 에 복사한다.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('..', '..');
const src = path.join(root, 'photos');
const out = path.join(root, 'design', 'mockup', 'img');
const pick = f => f.startsWith('site/') || f.includes('/cover-') || f.startsWith('rooms/suaegi/') || f.startsWith('rooms/jedori/');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let n = 0;
for (const abs of walk(src).filter(f => f.endsWith('.jpg'))) {
  const rel = path.relative(src, abs).split(path.sep).join('/');
  if (!pick(rel)) continue;
  fs.mkdirSync(path.dirname(path.join(out, rel)), { recursive: true });
  await sharp(abs).resize(900, 900, { fit: 'inside' }).jpeg({ quality: 70, mozjpeg: true }).toFile(path.join(out, rel));
  n++;
}
console.log(n);
