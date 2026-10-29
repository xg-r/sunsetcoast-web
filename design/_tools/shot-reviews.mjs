// 리뷰 영역만 찍는다: node shot-reviews.mjs
import { chromium } from 'playwright-core';
const BASE = process.env.BASE ?? 'http://localhost:4173';
const browser = await chromium.launch({ channel: 'chrome' });
for (const [dev, vp, mobile] of [['m', { width: 390, height: 844 }, true], ['pc', { width: 1440, height: 900 }, false]]) {
  const ctx = await browser.newContext({ viewport: vp, isMobile: mobile, hasTouch: mobile, locale: 'ko-KR' });
  const page = await ctx.newPage();
  for (const [name, url, sel] of [['home', '/', '#review-title'], ['nolmeong', '/rooms/nolmeong/', '#room-review-title']]) {
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
    const sec = page.locator(sel).locator('xpath=ancestor::section[1]');
    await sec.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await sec.screenshot({ path: `../shots/review-${name}-${dev}.png` });
    console.log(dev, name, 'overflowX=', await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth));
  }
  await ctx.close();
}
await browser.close();
