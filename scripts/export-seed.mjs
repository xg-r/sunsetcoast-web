// 지금 seed 데이터를 API 응답 모양으로 mocks/site-data.json 에 쓴다: node scripts/export-seed.mjs
// 목 서버(GET /site-data)가 이 파일을 응답한다. 백엔드 개발자에게는 실제 응답 예시가 된다.
// seed를 고친 뒤 다시 실행한다. (src/generated/images.json이 있어야 하므로 npm run images 뒤에)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sunsetcoast-seed-'));

// TS → CommonJS로 옮기면서 경로 별칭과 JSON import를 절대 경로로 바꾼다
const files = { 'data.ts': 'src/lib/data.ts', 'seed/index.ts': 'src/lib/seed/index.ts', 'types.ts': 'src/lib/types.ts' };
for (const [rel, src] of Object.entries(files)) {
  let code = fs.readFileSync(path.join(ROOT, src), 'utf8')
    .replace("'@/generated/images.json'", JSON.stringify(path.join(ROOT, 'src/generated/images.json')))
    .replace("'../../../data/location.json'", JSON.stringify(path.join(ROOT, 'data/location.json')));
  const out = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const dest = path.join(tmp, rel.replace(/\.ts$/, '.js'));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, out.outputText);
}

try {
  const { seedSiteData } = require(path.join(tmp, 'data.js'));
  const data = seedSiteData();
  const dest = path.join(ROOT, 'mocks', 'site-data.json');
  fs.writeFileSync(dest, JSON.stringify(data, null, 2) + '\n');
  console.log(`mocks/site-data.json ← seed (객실 ${data.rooms.length}동, 요금 ${data.rates.length}건, 리뷰 ${data.reviews.length}건)`);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
