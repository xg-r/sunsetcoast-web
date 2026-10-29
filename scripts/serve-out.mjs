// 빌드 결과(out/)를 로컬에서 확인하는 정적 서버. S3 + CloudFront처럼 /path/ → /path/index.html 로 응답한다.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', 'out');
const PORT = Number(process.env.PORT ?? 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };

export function rewriteSegmentPrefetch(p) {
  const m = p.match(/^(.*\/)__next\.([^/]+)\.txt$/);
  if (!m || fs.existsSync(path.join(ROOT, p))) return p;
  const [first, ...rest] = m[2].split('.');
  return rest.length ? `${m[1]}__next.${first}/${rest.join('/')}.txt` : p;
}

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  // Next 16 세그먼트 프리페치: __next.rooms.__PAGE__.txt → __next.rooms/__PAGE__.txt
  // (CloudFront Function에도 같은 규칙이 필요하다 — 5단계)
  p = rewriteSegmentPrefetch(p);
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  if (!fs.existsSync(file) && fs.existsSync(file + '/index.html')) {
    return res.writeHead(301, { Location: p + '/' }).end();
  }
  if (!fs.existsSync(file)) { res.statusCode = 404; file = path.join(ROOT, '404.html'); }
  res.setHeader('Content-Type', TYPES[path.extname(file)] ?? 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
