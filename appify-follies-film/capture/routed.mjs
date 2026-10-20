// Render an external page: the browser's requests are fulfilled by Playwright's own fetch (which trusts the proxy CA).
import { chromium } from "playwright-core";
export async function routedBrowser(opts = {}) {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell" });
  const ctx = await b.newContext({ userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36", proxy: { server: process.env.HTTPS_PROXY }, ...opts });
  await ctx.route("**/*", async (route) => {
    try { const r = await route.fetch({ timeout: 30000 }); await route.fulfill({ response: r }); } catch { await route.abort(); }
  });
  return { b, ctx };
}
