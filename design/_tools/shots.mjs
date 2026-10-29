// 로컬 서버(out/)를 휴대폰 화면(390×844, 터치)으로 열어 스크린샷을 찍는다: node shots.mjs
import { chromium } from 'playwright-core';
const BASE = 'http://localhost:4173';
const OUT = '../shots/';
const pages = process.argv.slice(2).length ? process.argv.slice(2) : [
  'home:/', 'rooms:/rooms/?pet=1', 'suaegi:/rooms/suaegi/', 'jedori:/rooms/jedori/', 'reservation:/reservation/', 'location:/location/', 'facilities:/facilities/',
];
const browser = await chromium.launch({ channel: 'chrome' });
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true, colorScheme: scheme, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const spec of pages) {
    const [name, url] = spec.split(/:(.*)/);
    if (scheme === 'dark' && name !== 'home' && name !== 'suaegi') continue;
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: `${OUT}${name}-${scheme}-first.png` });
    if (scheme === 'light') {
      // 지연 로딩 이미지를 모두 불러오도록 끝까지 스크롤한 뒤 전체 페이지를 찍는다
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${OUT}${name}-${scheme}-full.png`, fullPage: true });
    }
    console.log(scheme, name, 'overflowX=', overflow);
  }
  if (errors.length) console.log('errors:', [...new Set(errors)].join('\n'));
  await ctx.close();
}
await browser.close();
