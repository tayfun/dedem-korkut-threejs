// Sahne görüntüsü aracı: geliştirme sunucusu açıkken (npm run dev) sahnelerin ekran görüntüsünü alır.
// Playwright gerekir (projeye bağımlılık olarak eklenmedi; ortamda kurulu olmalı).
//
//   node tools/shots.mjs <hikaye> [seçenekler]
//
//   --scenes 1,4,7     hangi sahneler (varsayılan: hepsi)
//   --at 0.5,1         zaman çizelgesinin hangi anları, 0–1 (varsayılan: 1)
//   --out klasör       çıktı klasörü (varsayılan: shots)
//   --mobile           telefon genişliğinde (390×780)
//   --cam x,y,z        kamerayı elle yerleştir (yakın çekim için); --look ile birlikte, paneli gizler
//   --look x,y,z       kameranın baktığı nokta
//   --port 5173        geliştirme sunucusunun kapısı
//
// Örnekler:
//   node tools/shots.mjs deli-dumrul --at 0.3,1
//   node tools/shots.mjs deli-dumrul --scenes 2 --cam 0.5,3.25,2.1 --look 0,3.1,0
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [slug, ...rest] = process.argv.slice(2);
if (!slug) {
  console.error('Kullanım: node tools/shots.mjs <hikaye> [--scenes 1,2] [--at 0.5,1] [--out klasör] [--mobile] [--cam x,y,z --look x,y,z]');
  process.exit(1);
}
const opt = {};
for (let i = 0; i < rest.length; i++) {
  const key = rest[i].replace(/^--/, '');
  opt[key] = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : true;
}
const nums = (v) => String(v).split(',').map(Number);
const out = opt.out ?? 'shots';
const base = `http://localhost:${opt.port ?? 5173}`;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: opt.mobile ? { width: 390, height: 780 } : { width: 1100, height: 700 } });
const problems = [];
page.on('console', (m) => {
  if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('ReadPixels')) problems.push(`${m.type()}: ${m.text()}`);
});
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

const open = async (n) => {
  await page.goto(`${base}/#/hikaye/${slug}/${n}`);
  await page.reload();
  await page.waitForFunction(() => window.gsap && window.stage && document.querySelector('.text')?.textContent);
  await page.waitForTimeout(500);
};

await open(1);
const total = Number((await page.textContent('.count')).split('/')[1]);
const scenes = opt.scenes ? nums(opt.scenes) : Array.from({ length: total }, (_, i) => i + 1);
const times = opt.at ? nums(opt.at) : [1];

for (const n of scenes) {
  await open(n);
  for (const f of times) {
    await page.evaluate(
      ([f, cam, look]) => {
        // Sahnenin ana zaman çizelgesini istenen ana sar.
        const tls = window.gsap.globalTimeline.getChildren(false, false, true).filter((t) => t.duration() > 2);
        const tl = tls[tls.length - 1];
        tl.pause();
        tl.progress(f);
        if (cam && look) {
          document.querySelector('.reader').style.display = 'none';
          window.stage.setBottomInset(0);
          window.stage.setCamera(cam, look);
        }
      },
      [f, opt.cam ? nums(opt.cam) : null, opt.look ? nums(opt.look) : null],
    );
    await page.waitForTimeout(800);
    const file = `${out}/${slug}-${String(n).padStart(2, '0')}-${f}${opt.mobile ? '-m' : ''}.png`;
    await page.screenshot({ path: file });
    console.log(file);
  }
}
console.log(problems.length ? problems.join('\n') : 'Konsolda hata yok.');
await browser.close();
