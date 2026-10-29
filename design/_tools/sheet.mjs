// 폴더별 썸네일 접촉 시트(contact sheet)를 만든다: node sheet.mjs <rawDir> <outDir>
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
const [raw, out] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const T = 240, COLS = 6;
for (const dir of fs.readdirSync(raw)) {
  const files = fs.readdirSync(path.join(raw, dir)).filter(f => /\.(jpe?g|png)$/i.test(f))
    .sort((a, b) => parseInt(a) - parseInt(b));
  for (let page = 0; page * 24 < files.length; page++) {
    const chunk = files.slice(page * 24, page * 24 + 24);
    const rows = Math.ceil(chunk.length / COLS);
    const tiles = await Promise.all(chunk.map(async (f, i) => {
      const img = await sharp(path.join(raw, dir, f)).rotate().resize(T, T, { fit: 'cover' }).toBuffer();
      const label = Buffer.from(`<svg width="${T}" height="${T}"><rect width="70" height="30" fill="black"/><text x="6" y="22" font-size="20" fill="yellow" font-family="Arial">${f.replace(/\.\w+$/, '')}</text></svg>`);
      const tile = await sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer();
      return { input: tile, left: (i % COLS) * T, top: Math.floor(i / COLS) * T };
    }));
    await sharp({ create: { width: COLS * T, height: rows * T, channels: 3, background: '#fff' } })
      .composite(tiles).jpeg({ quality: 70 }).toFile(path.join(out, `${dir}_${page}.jpg`));
  }
}
console.log('done');
