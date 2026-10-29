// 백엔드 개발 전까지 쓰는 목 서버: npm run mock → http://localhost:8080
// 계약은 docs/api/sunset-time.md, docs/api/site-data.md. 장애 상황 확인용 모드:
//   MOCK_MODE=ok (기본) | error (503) | slow (8초 뒤 응답) | invalid (형식이 틀린 응답)
// GET /site-data 는 mocks/site-data.json(node scripts/export-seed.mjs로 생성)을 응답하고,
// Authorization: Bearer {MOCK_TOKEN} 을 확인한다 (기본 dev-token)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.PORT ?? 8080);
const MODE = process.env.MOCK_MODE ?? 'ok';
const TOKEN = process.env.MOCK_TOKEN ?? 'dev-token';
const kstDate = (offsetDays = 0) => new Date(Date.now() + 9 * 3600e3 + offsetDays * 864e5).toISOString().slice(0, 10);

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
  if (req.method === 'GET' && url.pathname === '/site-data') return siteData(req, res);
  if (req.method !== 'GET' || url.pathname !== '/sunset-time') {
    return res.writeHead(404, { ...cors, 'content-type': 'application/json' }).end('{"error":"not_found"}');
  }
  const mock = JSON.parse(fs.readFileSync(path.join(ROOT, 'mocks', 'sunset-time.json'), 'utf8'));
  if (MODE === 'error') return res.writeHead(503, { ...cors, 'content-type': 'application/json' }).end('{"error":"unavailable"}');
  if (MODE === 'slow') await new Promise((r) => setTimeout(r, 8000));
  const body = MODE === 'invalid'
    ? { today: { date: kstDate(), sunset: '5:50pm' } }
    : {
        today: { date: kstDate(), sunset: mock.today.sunset },
        tomorrow: { date: kstDate(1), sunset: mock.tomorrow.sunset },
      };
  res.writeHead(200, { ...cors, 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
  console.log(new Date().toISOString(), req.method, url.pathname, MODE);
}).listen(PORT, () => console.log(`mock backend (${MODE}) http://localhost:${PORT}/sunset-time, /site-data`));

/** 빌드 때 서버끼리 부르는 API라 CORS 헤더를 붙이지 않는다 */
async function siteData(req, res) {
  const json = (status, body) => res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' }).end(JSON.stringify(body));
  if (req.headers.authorization !== `Bearer ${TOKEN}`) return json(401, { error: 'unauthorized' });
  if (MODE === 'error') return json(503, { error: 'unavailable' });
  if (MODE === 'slow') await new Promise((r) => setTimeout(r, 40_000));
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'mocks', 'site-data.json'), 'utf8'));
  if (MODE === 'invalid') data.rates.push({ roomSlug: 'nowhere', seasonKey: 'offWeekday', price: -1 });
  json(200, data);
  console.log(new Date().toISOString(), req.method, '/site-data', MODE);
}
