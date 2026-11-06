# Darebni AI marketing mockups following Apple's marketing guidelines: official iPhone 18 Pro bezels, straight-on, unmodified
# (no tilt, crop, shadow, overlap or anything on top of the device), real app screens with a full status bar, copy beside the
# devices, the official black App Store badge (>= 40 px tall, quarter-height clear space). Writes one HTML per image.
import sys, os
D = sys.argv[1]
AR = 2760 / 1350
CSS = """
@font-face{font-family:Cond;src:url(barlow-condensed-latin-800-normal.woff2);font-weight:800}
@font-face{font-family:Bar;src:url(barlow-latin-600-normal.woff2);font-weight:600}
@font-face{font-family:BarR;src:url(barlow-latin-500-normal.woff2);font-weight:500}
*{margin:0;padding:0;box-sizing:border-box}
body{width:%dpx;height:%dpx;overflow:hidden;background:#07071A;position:relative;font-family:Bar;color:#F2F0EA}
.glow{position:absolute;inset:0;background:radial-gradient(circle at 50%% 60%%,rgba(91,78,229,.38),transparent 62%%)}
.grid{position:absolute;inset:0;background-image:linear-gradient(rgba(139,128,255,.08) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(139,128,255,.08) 1.5px,transparent 1.5px);background-size:60px 60px}
.D{font-family:Cond;font-weight:800;text-transform:uppercase;line-height:.92;letter-spacing:-.01em}
.dev{position:absolute;display:block}
.brand{position:absolute;display:flex;align-items:center;gap:14px}
.brand img{width:64px;height:64px;border-radius:16px}
.brand span{font-family:Cond;font-weight:800;font-size:40px;letter-spacing:.04em;text-transform:uppercase}
.lo{color:#8B80FF}.grn{color:#3DDC97}
.tick{display:flex;align-items:center;gap:18px;padding:20px 0;border-bottom:2px solid rgba(242,240,234,.16)}
.tick i{flex:none;width:52px;height:52px;border-radius:26px;background:#3DDC97;display:flex;align-items:center;justify-content:center}
.pill{display:inline-block;padding:8px 20px;border-radius:12px;background:#FFC94A;color:#07071A;font-family:Cond;font-weight:800;font-size:32px;letter-spacing:.06em;text-transform:uppercase}
.num{display:inline-flex;width:54px;height:54px;border-radius:27px;background:#5B4EE5;border:3px solid #8B80FF;align-items:center;justify-content:center;font-family:Cond;font-weight:800;font-size:32px}
"""
TICK = '<i><svg width="30" height="30" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#07071A" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg></i>'
def dev(name, x, y, h): return f'<img class="dev" src="{name}.png" style="left:{x}px;top:{y}px;height:{h}px;width:{h / AR:.1f}px">'
def badge(x, y, h): return f'<img src="badge.svg" style="position:absolute;left:{x}px;top:{y}px;height:{h}px">'
def page(w, h, body): return f'<!doctype html><html><head><meta charset="utf-8"><style>{CSS % (w, h)}</style></head><body><div class="glow"></div><div class="grid"></div>{body}</body></html>'
def brand(x, y): return f'<div class="brand" style="left:{x}px;top:{y}px"><img src="darebni-icon.png"><span>Darebni AI</span></div>'
P = {}
# ── Instagram 1080x1350 ──
P["ig-1-hero"] = page(1080, 1350, brand(64, 120) + f"""
<div style="position:absolute;left:64px;top:250px;width:420px">
  <div class="D" style="font-size:118px">Your AI<br>workout<br><span class="lo">coach</span></div>
  <div style="font-family:BarR;font-size:36px;line-height:1.25;color:rgba(242,240,234,.85);margin-top:30px">Weekly plans with your sets, reps &amp; weights. Built for you. Tracked every set.</div>
  <div style="margin-top:34px;font-size:27px" class="pill">#3 Health &amp; Fitness · Lebanon</div>
</div>
{badge(64, 1110, 96)}
{dev("home", 496, 100, 1150)}""")
labels = [("onboarding", "1", "Tell it about you"), ("home", "2", "Get your week"), ("logging", "3", "Log every set")]
h2 = 690; w2 = h2 / AR; gap = (1080 - 3 * w2) / 4
cols = "".join(dev(n, gap + i * (w2 + gap), 330, h2) + f'<div style="position:absolute;left:{gap + i * (w2 + gap)}px;width:{w2:.0f}px;top:1045px;text-align:center"><span class="num">{k}</span><div class="D" style="font-size:40px;margin-top:12px">{t}</div></div>' for i, (n, k, t) in enumerate(labels))
P["ig-2-how"] = page(1080, 1350, brand(64, 90) + """
<div style="position:absolute;left:64px;right:64px;top:180px"><div class="D" style="font-size:104px">How it <span class="lo">works</span></div></div>""" + cols + badge(415, 1205, 84))
P["ig-3-tracker"] = page(1080, 1350, dev("logging", 50, 100, 1150) + brand(616, 120) + f"""
<div style="position:absolute;left:616px;right:56px;top:250px">
  <div class="pill">Smart tracker</div>
  <div class="D" style="font-size:96px;margin-top:22px">Log every<br>set, <span class="grn">live</span></div>
  <div style="margin-top:30px;border-top:2px solid rgba(242,240,234,.16)">
    <div class="tick">{TICK}<span style="font-size:34px">kg &amp; reps,<br>set by set</span></div>
    <div class="tick">{TICK}<span style="font-size:34px">Built-in<br>rest timer</span></div>
    <div class="tick">{TICK}<span style="font-size:34px">Your plan's numbers,<br>ready to go</span></div>
  </div>
</div>{badge(616, 1150, 84)}""")
h4 = 900; w4 = h4 / AR; g4 = (1080 - 2 * w4) / 3
P["ig-4-progress"] = page(1080, 1350, brand(64, 90) + """
<div style="position:absolute;left:64px;right:64px;top:180px"><div class="D" style="font-size:104px">See your <span class="grn">progress</span></div></div>""" +
  "".join(dev(n, g4 + i * (w4 + g4), 310, h4) + f'<div class="D" style="position:absolute;left:{g4 + i * (w4 + g4)}px;width:{w4:.0f}px;top:1235px;text-align:center;font-size:42px">{t}</div>' for i, (n, t) in enumerate([("analytics", "Weekly AI analysis"), ("pinned", "Every PR, tracked")])))
# ── App Store screenshots 1320x2868 ──
AS = [("onboarding", "Built <span class='lo'>around you</span>", "Answer a few questions. Get a plan for your goal, level and schedule."),
      ("home", "Your week, <span class='lo'>planned</span>", "Every session with sets, reps and rest, ready when you are."),
      ("logging", "Log every set, <span class='grn'>live</span>", "Weights, reps and a rest timer in one place."),
      ("analytics", "Weekly <span class='lo'>AI analysis</span>", "See your streak, your goals and how your lifts moved."),
      ("explore", "1,300+ <span class='grn'>exercises</span>", "Plus 70 ready-made workouts for the gym and home."),
      ("pinned", "Track every <span class='grn'>PR</span>", "Your best lifts and estimated 1RM, over time.")]
for i, (n, t, s) in enumerate(AS):
    hh = 2050; ww = hh / AR
    P[f"as-{i + 1}-{n}"] = page(1320, 2868, f"""
<div style="position:absolute;left:50px;right:50px;top:200px;text-align:center">
  <div class="D" style="font-size:136px;white-space:nowrap">{t}</div>
  <div style="font-family:BarR;font-size:54px;line-height:1.25;color:rgba(242,240,234,.85);margin-top:34px">{s}</div>
</div>{dev(n, (1320 - ww) / 2, 720, hh)}""")
for k, v in P.items(): open(f"{D}/{k}.html", "w").write(v)
print(len(P), "pages")
# ── Instagram stories 1080x1920 (story safe zone: content between y 250 and 1700) ──
Q = {}
Q["st-1-hero"] = page(1080, 1920, brand(64, 250) + f"""
<div style="position:absolute;left:64px;right:64px;top:350px">
  <div class="D" style="font-size:124px">Your AI<br>workout <span class="lo">coach</span></div>
  <div style="font-family:BarR;font-size:36px;line-height:1.25;color:rgba(242,240,234,.85);margin-top:20px">Weekly plans with your sets, reps &amp; weights.<br>Built for you. Tracked every set.</div>
</div>
{dev("home", (1080 - 960 / AR) / 2, 730, 960)}""")
h2 = 700; w2 = h2 / AR; gap = (1080 - 3 * w2) / 4
Q["st-2-how"] = page(1080, 1920, brand(64, 250) + """
<div style="position:absolute;left:64px;right:64px;top:350px"><div class="D" style="font-size:124px">How it <span class="lo">works</span></div>
<div style="font-family:BarR;font-size:38px;color:rgba(242,240,234,.85);margin-top:20px">From your goal to every set, in three steps.</div></div>""" +
  "".join(dev(n, gap + i * (w2 + gap), 640, h2) + f'<div style="position:absolute;left:{gap + i * (w2 + gap)}px;width:{w2:.0f}px;top:1370px;text-align:center"><span class="num">{k}</span><div class="D" style="font-size:42px;margin-top:14px">{t}</div></div>' for i, (n, k, t) in enumerate(labels)) + badge(415, 1560, 84))
Q["st-3-tracker"] = page(1080, 1920, brand(64, 250) + f"""
<div style="position:absolute;left:64px;right:64px;top:350px"><div class="pill">Smart tracker</div>
  <div class="D" style="font-size:118px;margin-top:20px">Log every set, <span class="grn">live</span></div></div>
{dev("logging", 50, 640, 1040)}
<div style="position:absolute;left:600px;right:50px;top:820px;border-top:2px solid rgba(242,240,234,.16)">
  <div class="tick">{TICK}<span style="font-size:36px">kg &amp; reps,<br>set by set</span></div>
  <div class="tick">{TICK}<span style="font-size:36px">Built-in<br>rest timer</span></div>
  <div class="tick">{TICK}<span style="font-size:36px">Your plan's<br>numbers, ready</span></div>
</div>{badge(600, 1440, 84)}""")
h4 = 1000; w4 = h4 / AR; g4 = (1080 - 2 * w4) / 3
Q["st-4-progress"] = page(1080, 1920, brand(64, 250) + """
<div style="position:absolute;left:64px;right:64px;top:350px"><div class="D" style="font-size:124px">See your <span class="grn">progress</span></div></div>""" +
  "".join(dev(n, g4 + i * (w4 + g4), 540, h4) + f'<div class="D" style="position:absolute;left:{g4 + i * (w4 + g4)}px;width:{w4:.0f}px;top:1575px;text-align:center;font-size:44px">{t}</div>' for i, (n, t) in enumerate([("analytics", "Weekly AI analysis"), ("pinned", "Every PR, tracked")])))
for k, v in Q.items(): open(f"{D}/{k}.html", "w").write(v)
print(len(Q), "story pages")
