const { chromium } = require('playwright'); const fs = require('fs');
(async () => { const [dir, out] = process.argv.slice(2); const b = await chromium.launch();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html'))) {
    const vp = f.startsWith('as-') ? { width: 1320, height: 2868 } : f.startsWith('st-') ? { width: 1080, height: 1920 } : { width: 1080, height: 1350 }; const p = await b.newPage({ viewport: vp });
    await p.goto('file://' + dir + '/' + f); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: out + '/' + f.replace('.html', '.png') }); await p.close(); }
  await b.close(); })();
