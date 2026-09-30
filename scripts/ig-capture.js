/**
 * Paste this into the browser console on https://www.instagram.com/<handle>/
 * and save the output to scripts/ig-raw.json, then run:
 *   npm run instagram:import
 *
 * Reads the grid the page has already rendered — no token, no login.
 */
(() => {
  const seen = new Set();
  const posts = [];
  for (const a of document.querySelectorAll('a[href*="/reel/"], a[href*="/p/"]')) {
    const href = a.getAttribute("href");
    const m = href.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/);
    if (!m || seen.has(m[2])) continue;
    seen.add(m[2]);
    const img = a.querySelector("img");
    posts.push({
      code: m[2],
      kind: m[1],
      href: "https://www.instagram.com" + href,
      img: img ? img.src : null,
      alt: img ? img.alt || "" : "",
    });
    if (posts.length >= 12) break;
  }
  const avatar = [...document.querySelectorAll("img")].find((i) =>
    /profile picture/i.test(i.alt || "")
  );
  return JSON.stringify({ posts, avatar: avatar ? { src: avatar.src } : null }, null, 2);
})();
