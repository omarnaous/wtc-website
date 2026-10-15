# Gemini 3.5 spec commercial: "Just hand it over."

~24 s, 9:16, voice-over led. **Spec ad: unofficial, not affiliated with Google.** The spark is a four-point star drawn
in the Gemini gradient and "Gemini 3.5" is set in DM Sans: approximations, not Google's official logo files or font.

Facts used (from coverage of Google I/O 2026, May 19): Gemini 3.5 Flash was positioned for agentic work and coding,
multimodal, with background/scheduled agents (Antigravity 2.0, Managed Agents, Gemini Spark). The prompt, the task list,
the code, the sketch, the site and the notifications are illustrative.

One idea: the spark does the work. It types the job as the cursor, bursts into the mark, ticks the plan, writes the
code, scans the sketch, builds the site, twinkles as a star while you sleep, and returns as the mark.

- Voice: `python3 vo/vo.py <kokoro-dir>` (Kokoro af_heart + Praat intonation) → `vo/vo.wav`, `src/vo.json` (line timings).
- Scenes hang off the voice: `src/timing.js`. Picture: `src/Main.jsx`.
- Sound: `python3 sound/score.py` → `public/sound.wav` (+ `sound-nomusic.wav`). Render: `node render.mjs Reel`.
