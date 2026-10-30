// 백엔드 개발 전까지 쓰는 목 서버: npm run mock → http://localhost:8080
// 계약은 docs/api/sunset-time.md. 장애 상황 확인용 모드:
//   MOCK_MODE=ok (기본) | error (503) | slow (8초 뒤 응답) | invalid (형식이 틀린 응답)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = Number(process.env.PORT ?? 8080);
const MODE = process.env.MOCK_MODE ?? 'ok';
const kstDate = (offsetDays = 0) => new Date(Date.now() + 9 * 3600e3 + offsetDays * 864e5).toISOString().slice(0, 10);

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, OPTIONS',
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'OPTIONS') return res.writeHead(204, cors).end();
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
}).listen(PORT, () => console.log(`mock backend (${MODE}) http://localhost:${PORT}/sunset-time`));

