// 고객 페이지 주요 동작 확인: node interact.mjs
import { chromium } from 'playwright-core';
const B = 'http://localhost:4173';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const bad = [];
p.on('response', (r) => r.status() >= 400 && bad.push(r.status() + ' ' + r.url()));
p.on('pageerror', (e) => bad.push('pageerror ' + e.message));
const ok = (c, m) => console.log(c ? 'PASS' : 'FAIL', m);

await p.goto(B + '/rooms/?pet=1', { waitUntil: 'networkidle' });
const pet = await p.$$eval('li:not([hidden]) article h3', (h) => h.map((x) => x.textContent));
ok(pet.join() === '놀멍,제돌이,태산이,고래,해안,바람', '반려견 필터 6개: ' + pet.join());
await p.getByRole('button', { name: '프리미엄' }).click();
ok(p.url().includes('tier=premium') && p.url().includes('pet=1'), '필터가 URL에 남음: ' + p.url());
const all = await p.goto(B + '/rooms/', { waitUntil: 'networkidle' }).then(() => p.$$eval('li:not([hidden]) article', (a) => a.length));
ok(all === 14, '전체 14개: ' + all);
const tiers = await p.$$eval('li article', (a) => a.map((x) => x.querySelector('span.text-xs')?.textContent));
ok(['프리미엄', '에어스트림', '가성비'].every((t) => tiers.includes(t)) && tiers.filter((t) => t === '프리미엄').length === 4 && tiers.filter((t) => t === '에어스트림').length === 5, '등급 4·5·5');
const toilets = await p.$$eval('li article', (a) => a.filter((x) => x.textContent.includes('개별 화장실')).length);
ok(toilets === 14, '모든 카드에 개별 화장실: ' + toilets);

// 비교
for (const n of ['놀멍', '수애기', '고래']) await p.locator('article').filter({ has: p.getByRole('heading', { name: n, exact: true }) }).getByRole('button', { name: /비교 담기/ }).click();
await p.getByRole('link', { name: '비교하기' }).click();
await p.waitForURL(/compare/);
await p.waitForSelector('table');
const heads = await p.$$eval('thead b', (x) => x.map((e) => e.textContent));
ok(heads.join() === '놀멍,수애기,고래', '비교 3개: ' + heads.join());

// 갤러리 · 라이트박스
await p.goto(B + '/rooms/jedori/', { waitUntil: 'networkidle' });
const tabs = await p.$$eval('[role=tab]', (t) => t.map((x) => x.textContent.replace(/\d+$/, '')));
ok(tabs[1] === '욕실', '욕실 탭이 두 번째: ' + tabs.join());
ok(await p.getByText('욕실 사진 준비 중').isVisible(), '제돌이 욕실 사진 준비 중 표시');
await p.goto(B + '/rooms/suaegi/', { waitUntil: 'networkidle' });
ok(!(await p.getByText('욕실 사진 준비 중').count()), '수애기는 자리표시 없음');
const factsVisible = await p.$eval('dl', (d) => d.getBoundingClientRect().bottom <= window.innerHeight - 70);
ok(factsVisible, '핵심 정보 4칸이 첫 화면(예약 바 위)에 보임');
await p.getByRole('tab', { name: /욕실/ }).click();
await p.getByRole('button', { name: /크게 보기/ }).first().click();
ok(await p.locator('dialog[open]').isVisible(), '라이트박스 열림');
await p.keyboard.press('Escape');
ok(!(await p.locator('dialog[open]').count()), '라이트박스 닫힘');

// 예약 버튼
const links = await p.$$eval('[data-track=booking_click]', (a) => a.map((x) => x.textContent + '→' + x.getAttribute('href')));
ok(links.some((l) => l.includes('ddnayo')) && !links.some((l) => l.includes('네이버')), '떠나요만 표시, 네이버 숨김: ' + [...new Set(links)].join(' | '));
ok(await p.$eval('a[href^="tel:"]', (a) => a.getAttribute('href')) === 'tel:01047417064', '전화 링크');

// 메타
const og = await p.$eval('meta[property="og:image"]', (m) => m.content);
ok(/og\/rooms-suaegi-cover-01/.test(og), 'OG 이미지가 객실 대표 사진: ' + og);
console.log(bad.length ? 'ERRORS:\n' + [...new Set(bad)].join('\n') : 'no network/page errors');
await b.close();
