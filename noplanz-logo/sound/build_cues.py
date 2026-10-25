"""Sound for the No Planz reveal, from src/timing.js. Two pops as the dots appear, soft blips while they wander, two
quick blips when they notice each other, a whoosh as they dash, a zip while the route draws, the hit (impact + chime)
with a sparkle of pops for the crowd, a whoosh into the word, a rising pop per letter, a glint on the tagline, and a
warm pad under the end frame. Tonal cues sit in A major (A, C#, E).
  python3 sound/build_cues.py && python3 <motion-graphics>/scripts/sound.py sound/cues.json public/sound.wav"""
import json, re
src = open("src/timing.js").read()
T = {k: int(v) for k, v in re.findall(r"(\w+): (\d+)", src.split("export const T")[1])}
DUR = int(re.search(r"DURATION = (\d+)", src).group(1))
A = [440.0, 554.37, 659.25, 880.0, 1108.73, 1318.51, 1760.0]
cues = [{"type": "pop", "frame": T["popA"], "gain": 0.16, "pan": -0.3}, {"type": "pop", "frame": T["popB"], "gain": 0.16, "pan": 0.3}]
cues += [{"type": "blip", "frame": fr, "gain": 0.03, "freq": A[i % 3], "pan": (-0.35, 0.35)[i % 2]} for i, fr in enumerate(range(T["wander"] + 2, T["spot"], 5))]
cues += [{"type": "tick", "frame": T["spot"] + 1, "gain": 0.08, "freq": 1760}, {"type": "tick", "frame": T["spot"] + 4, "gain": 0.08, "freq": 2217.5}]
cues += [{"type": "whoosh", "start": T["dash"] - 2, "end": T["draw"] + 6, "gain": 0.12},
         {"type": "riser", "start": T["draw"] - 2, "end": T["hit"] - 1, "gain": 0.12}]
cues += [{"type": "impact", "frame": T["hit"], "gain": 0.55}, {"type": "chime", "frame": T["hit"] + 1, "gain": 0.12, "freq": 1318.51},
         {"type": "glint", "frame": T["hit"] + 3, "gain": 0.05, "freq": 2637}]
cues += [{"type": "pop", "frame": T["hit"] + 2 + k * 2, "gain": 0.04, "pan": ((k * 37) % 9 - 4) / 5} for k in range(6)]
cues += [{"type": "whoosh", "start": T["morph"] - 2, "end": T["morph"] + 14, "gain": 0.08}]
cues += [{"type": "pop", "frame": T["word"] + i * 3, "gain": 0.07, "pan": -0.4 + i * 0.16} for i in range(6)]
cues += [{"type": "blip", "frame": T["word"] + i * 3, "gain": 0.025, "freq": A[i]} for i in range(6)]
cues += [{"type": "glint", "frame": T["tag"] + 2, "gain": 0.05, "freq": 1760},
         {"type": "pad", "start": T["hit"], "gain": 0.06, "chord": [110, 164.81, 220, 277.18, 329.63]}]
spec = {"fps": 30, "duration": DUR / 30, "seed": 5, "fade_out": 1.2, "peak_db": -3, "cues": cues}
json.dump(spec, open("sound/cues.json", "w"), indent=1); print("sound/cues.json", len(cues), "cues")
