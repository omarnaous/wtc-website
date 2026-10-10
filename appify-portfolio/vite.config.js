import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `npm run dev` -> http://localhost:5173 · `npm run build` -> dist/ (static: Netlify, Vercel, Cloudflare Pages)
export default defineConfig({
  plugins: [react()],
});
