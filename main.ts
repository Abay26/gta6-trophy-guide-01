// Leonida Legend — GTA VI trophy guide entry for gta6-trophy-guide-01 (Node 22,
// standard library only). The guide itself is plain static files under app/:
// index.html + app.js + style.css + data/trophies.json, served offline with no
// build step and no network request at run time. This program hands the guide
// in: it copies app/ and screenshots/ from beside this file into the output
// directory and writes /output/dossier.json with the vendored make.fun library
// (vendor/makefun-frontend.ts, left exactly as the kit shipped it — the scorer
// rebuilds the dossier with its own copy and compares byte for byte).
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Running it twice writes byte-identical output.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const appDir = join(repoRoot, 'app');
const shotsDir = join(repoRoot, 'screenshots');

// Refuse to hand in a broken entry rather than silently copying it: the app
// must exist with its entry page, and screenshots/ must hold 3 or 4 images.
function fail(message: string): never {
  throw new Error(`gta6-trophy-guide-01 main.ts: ${message}`);
}

if (!existsSync(join(appDir, 'index.html'))) fail('app/index.html is missing');
if (!existsSync(join(appDir, 'data', 'trophies.json'))) fail('app/data/trophies.json is missing');
// The gate holds trophies.json to the same 55 official names, each with a
// non-blank guide: refuse a build that lost a trophy or a guide on the way.
const trophyDoc = JSON.parse(readFileSync(join(appDir, 'data', 'trophies.json'), 'utf8')) as {
  trophies: { name: string; guide: string }[];
};
if (!Array.isArray(trophyDoc.trophies) || trophyDoc.trophies.length !== 55) {
  fail(`app/data/trophies.json holds ${trophyDoc.trophies?.length ?? 0} trophies, expected 55`);
}
for (const t of trophyDoc.trophies) {
  if (!t.name || !t.guide?.trim()) fail(`trophy ${JSON.stringify(t.name)} has no guide`);
}
if (!existsSync(shotsDir)) fail('screenshots/ is missing');
const shots = readdirSync(shotsDir)
  .filter((name) => !name.startsWith('.'))
  .filter((name) => statSync(join(shotsDir, name)).isFile());
if (shots.length < 3 || shots.length > 4) fail(`screenshots/ holds ${shots.length} images, expected 3 or 4`);

mkdirSync(outDir, { recursive: true });
cpSync(appDir, join(outDir, 'app'), { recursive: true });
cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files: app/ counts beside /output's own 1000-entry cap,
// its screenshots/ and dossier.json).
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
