// 로컬 서버(기본 out/ 서빙, BASE로 바꿈)를 휴대폰·PC 화면으로 찍는다: node shot-dev.mjs
import { chromium } from 'playwright-core';
const BASE = process.env.BASE ?? 'http://localhost:4173';
const pages = ['home:/', 'rooms:/rooms/?pet=1', 'jedori:/rooms/jedori/', 'reservation:/reservation/'];
const browser = await chromium.launch({ channel: 'chrome' });
for (const [dev, vp, mobile] of [['m', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]]) {
  for (const scheme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, colorScheme: scheme, locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const spec of pages) {
      const [name, url] = spec.split(/:(.*)/);
      if (scheme === 'dark' && name !== 'home') continue;
      await page.goto(BASE + url, { waitUntil: 'networkidle', timeout: 120000 });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(600);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await page.screenshot({ path: `../shots/new-${name}-${dev}-${scheme}.png`, fullPage: scheme === 'light' });
      console.log(dev, scheme, name, 'overflowX=', overflow);
    }
    if (errors.length) console.log('errors:', [...new Set(errors)].join('\n'));
    await ctx.close();
  }
}
await browser.close();
