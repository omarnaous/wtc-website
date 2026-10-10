import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `npm run dev` -> http://localhost:5173 · `npm run build` -> dist/ (static: Netlify, Vercel, Cloudflare Pages)
// `npm run build:artifact` -> dist-artifact/ + page.html, for publishing as a claude.ai artifact
// (fonts inlined: the artifact frame only loads fonts from Google Fonts or data: URIs).
export default defineConfig(({ mode }) => ({
  base: "./",
  plugins: [react()],
  build: mode === "artifact" ? { outDir: "dist-artifact", assetsInlineLimit: 1_000_000 } : {},
}));
