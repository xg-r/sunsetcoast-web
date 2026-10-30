// 방송 영역만 찍는다: node shot-media.mjs (홈의 한 줄, 소개 페이지의 방송 섹션)
import { chromium } from 'playwright-core';
const BASE = process.env.BASE ?? 'http://localhost:4173';
const browser = await chromium.launch({ channel: 'chrome' });
for (const [dev, vp, mobile] of [['m', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR' });
  const page = await ctx.newPage();
  for (const [name, url, sel] of [['home', '/', 'section[aria-label="안심 포인트"]'], ['about', '/about/', '#tv']]) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    const sec = page.locator(sel);
    await sec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await sec.screenshot({ path: `../shots/media-${name}-${dev}.png` });
    console.log(dev, name, 'overflowX=', await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
  }
  await ctx.close();
}
await browser.close();
