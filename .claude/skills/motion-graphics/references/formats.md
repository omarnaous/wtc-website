# Formats and platforms

| Use | Size | Notes |
|---|---|---|
| Instagram feed post | 1080×1350 (4:5) | Best feed real estate. Grid preview crops to 3:4 center, so keep key content central. |
| Instagram Reels / Stories, TikTok, Shorts | 1080×1920 (9:16) | Safe zone: keep text out of the top ~250 px and bottom ~340 px (UI overlays), and ~60 px from the sides. |
| Instagram grid square | 1080×1080 (1:1) | Also fine for LinkedIn and X. |
| Stream / YouTube background, desktop | 1920×1080 (16:9) | For a stream background, keep the center calmer (webcam and overlays sit there). |
| 4K | 3840×2160 | Only when asked; renders ~4× slower. |

- fps: 30 by default; 60 for very fast motion or gaming content if asked.
- Codec: H.264 MP4, yuv420p, AAC. Instagram and TikTok cap at 60 s for most feed uses; keep motion pieces 6-20 s.
- "For Instagram" with no aspect → render 4:5 for the feed and 9:16 for Reels from the same component.
- "Grid" or "feed and stream background" → render each requested size; design layout from `width`/`height`, never hardcoded positions.
- Loops for the grid: Instagram autoplays and loops, so a seamless loop looks intentional there.
