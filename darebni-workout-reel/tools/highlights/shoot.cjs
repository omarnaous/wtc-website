const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const d = process.argv[2]; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const f of fs.readdirSync(d).filter((x) => x.endsWith('.html'))) { await p.goto('file://' + d + '/' + f); await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: d + '/' + f.replace('.html', '.png') }); }
  await b.close(); })();
