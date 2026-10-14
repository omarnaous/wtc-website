"""Writes src/drops.json: the jelly droplets thrown by the pop (start, velocity, size, landing frame).
Picture (Main.jsx) and sound (build.py) both read it, so every drip you hear is a drop you see landing."""
import json, math, random, re
src = open("src/timing.js").read()
g = lambda k: int(re.search(rf"export const {k} = (\d+)", src).group(1))
IMPACT, R, CX = g("IMPACT"), 230, 540
FLOOR = int(re.search(r"FLOOR = (\d+)", src).group(1))
rnd = random.Random(7)
drops, G = [], 1.25
for i in range(54):
    side = -1 if i % 2 else 1
    x0 = CX + side * rnd.uniform(0, 1) * R * 0.95
    y0 = FLOOR - rnd.uniform(10, 120)
    vx = side * rnd.uniform(4, 34)
    vy = -rnd.uniform(4, 30)
    r = rnd.choice([rnd.uniform(8, 18), rnd.uniform(14, 30), rnd.uniform(22, 42)])
    tl = (-vy + math.sqrt(vy * vy + 2 * G * (FLOOR - y0))) / G
    xl = x0 + vx * tl
    on_plate = abs(xl - CX) < 410
    drops.append({"x0": round(x0, 1), "y0": round(y0, 1), "vx": round(vx, 2), "vy": round(vy, 2), "r": round(r, 1),
                  "land": round(IMPACT + tl, 2) if on_plate else None, "xl": round(xl, 1)})
json.dump({"g": G, "drops": drops}, open("src/drops.json", "w"), indent=0)
print(len(drops), "drops,", sum(d["land"] is not None for d in drops), "land on the plate")
