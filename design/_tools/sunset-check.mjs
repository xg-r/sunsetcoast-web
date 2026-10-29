// 노을 시각 장애 처리 확인: 목 서버를 모드별로 띄우고 홈에서 표시를 본다. node sunset-check.mjs
import { spawn } from 'node:child_process';
import path from 'node:path';
import { chromium } from 'playwright-core';

const mock = path.resolve(import.meta.dirname, '../../scripts/mock-backend.mjs');
// 8080을 다른 서버(예: 실제 백엔드)가 쓰고 있으면 목 서버가 뜨지 못하므로 바로 멈춘다
const start = (mode) => new Promise((resolve, reject) => {
  const p = spawn(process.execPath, [mock], { env: { ...process.env, MOCK_MODE: mode } });
  p.stdout.once('data', () => resolve(p));
  p.once('exit', () => reject(new Error('목 서버를 띄우지 못함. 8080 포트를 쓰는 다른 서버를 끄고 다시 실행하세요')));
});

const b = await chromium.launch({ channel: 'chrome' });
for (const mode of ['ok', 'error', 'slow', 'invalid', 'down']) {
  const srv = mode === 'down' ? null : await start(mode);
  // 모드마다 새 브라우저 컨텍스트 (응답 캐시가 섞이지 않게)
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, timezoneId: 'Asia/Seoul' });
  const page = await ctx.newPage();
  const t0 = Date.now();
  await page.goto('http://localhost:4173/', { waitUntil: 'load' });
  await page.waitForFunction(() => {
    const el = document.querySelector('[aria-busy]');
    return !el || el.getAttribute('aria-busy') === 'false';
  }, null, { timeout: 10000 });
  const shown = await page.$eval('[aria-busy]', (e) => e.innerText.replace(/\s+/g, ' ')).catch(() => '(숨김)');
  const hero = await page.getByRole('link', { name: '객실 둘러보기' }).isVisible();
  console.log(`${mode.padEnd(8)} ${String(Date.now() - t0).padStart(5)}ms  노을: ${shown}  | 나머지 화면 정상: ${hero}`);
  await ctx.close();
  srv?.kill();
}
await b.close();
