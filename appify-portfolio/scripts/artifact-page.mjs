// Turn dist-artifact/index.html into page.html for a claude.ai artifact: the artifact host adds its own
// <!doctype>/<html>/<head>/<body>, so the page is just its title, the built CSS/JS and the root node.
import fs from "node:fs";
const html = fs.readFileSync("dist-artifact/index.html", "utf8");
const tags = [...html.matchAll(/<(script|link)\b[^>]*(?:src|href)="\.\/assets\/[^"]+"[^>]*>(?:<\/script>)?/g)].map((m) => m[0]);
const page = `<title>Appify Portfolio</title>\n<meta name="description" content="Appify: motion graphics, websites, mobile apps and AI agents.">\n<link rel="icon" type="image/svg+xml" href="./favicon.svg">\n${tags.join("\n")}\n<div id="root"></div>\n`;
fs.writeFileSync("dist-artifact/page.html", page);
console.log("dist-artifact/page.html:", tags.length, "asset tags");
