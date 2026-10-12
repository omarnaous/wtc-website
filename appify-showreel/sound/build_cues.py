"""Soundtrack for the showreel on src/timing.js (80 BPM tape lo-fi; a style = 2 beats, so every cut is on a strong beat).
The bed is muffled under the hook and the filter opens on the first spark cut; each cut gets a doppler swoosh
(pitch varied so ten cuts don't sound the same), the bar downbeats also get a reversed swell into the cut and a soft
sub landing. Two real hits (the particle boom, the logo), a tape stop into the end card, a beat of near-silence,
then the CTA stamp and the bed comes back, muffled, under the end card.
  python3 sound/build_cues.py          -> sound/cues.json        (music + transitions)
  python3 sound/build_cues.py --sfx    -> sound/cues-sfx.json    (transitions only, to post with a trending track)"""
import json, re, sys
src = open("src/timing.js").read()
g = lambda k: float(re.search(rf"export const {k} = ([\d.]+)", src).group(1))
B, S0, L, N, DUR = g("BEAT"), int(g("STYLE0")), int(g("STYLE_LEN")), int(g("N")), int(g("DURATION"))
END = S0 + N * L
st = lambda i: S0 + i * L
BPM = 30 * 60 / B
PASS = [2400, 3100, 2000, 2800, 3400, 2200, 2600, 3000, 1900, 2500]   # swoosh pass frequency per cut
sfx_only = "--sfx" in sys.argv
cues = [] if sfx_only else [
    # the bed: muffled under the hook, opens on the first spark cut, tape-stops into the end card
    {"type": "lofi_tape", "start": 0, "end": END, "bpm": BPM, "gain": 0.42, "lp_auto": [[0, 800], [S0 - 8, 900], [S0 + 2, 6800]], "stop": [END - 14, END]},
    # back after a beat of silence, muffled and softer, under the CTA
    {"type": "lofi_tape", "start": END + 28, "end": DUR, "bpm": BPM, "gain": 0.36, "lp": 1900, "drums": 0.7, "lead": 0},
]
cues += [
    # hook: the spark slams in on frame 0, bursts into the 9 numbers, number 1 lights up
    {"type": "thump", "frame": 0, "gain": 0.3},
    {"type": "impact", "frame": 1, "gain": 0.12},
    {"type": "swoosh", "start": 8, "end": 24, "peak": 0.4, "f": 3600, "gain": 0.16},
    {"type": "glint", "frame": 32, "gain": 0.04},
]
for i in range(N + 1):   # every spark cut (the 10th opens the end card)
    a = st(i)
    cues.append({"type": "swoosh", "start": a - 7, "end": a + 9, "peak": 0.45, "f": PASS[i], "gain": 0.2, "pan": (-0.35, 0.35)[i % 2]})
    if a % round(4 * B) == 0 and i < N:   # bar downbeats: reverse swell into the cut + a soft sub landing
        cues.append({"type": "reverse_swell", "start": a - 20, "end": a, "gain": 0.13, "notes": ["E3", "G3", "B3", "D4"]})
    if a % round(4 * B) == 0 or i == N:
        cues.append({"type": "thump", "frame": a, "gain": 0.16})
cues += [
    {"type": "impact", "frame": st(6) + 20, "gain": 0.22},                          # 07 launch FX: the boom
    {"type": "thump", "frame": st(6) + 20, "freq": 45, "gain": 0.25},
    {"type": "impact", "frame": st(8) + 22, "gain": 0.14},                          # 09 the logo lands
    {"type": "glint", "frame": st(8) + 24, "gain": 0.05},
    {"type": "stamp", "frame": END + 30, "gain": 0.2},                              # Comment "MOTION"
]
spec = {"fps": 30, "duration": DUR / 30, "seed": 21, "fade_out": 1.0, "lowpass": 9000, "cues": cues}
out = "sound/cues-sfx.json" if sfx_only else "sound/cues.json"
json.dump(spec, open(out, "w"), indent=1)
print(out, len(cues), "cues at", BPM, "BPM")
