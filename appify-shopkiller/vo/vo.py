"""Voice-over for the Shopify Killer reel, generated locally with Kokoro TTS (voice am_puck), then
re-intonated with Praat PSOLA so it reads like a person, not a flat TTS line:
each line is split into phrases, and every phrase gets its own pace, register, pitch range,
melody (rise / fall / arch), loudness and the pause after it.
Each line starts on its scene's frame; outputs vo.wav, per-frame mouth envelope and word timings.
usage: python3 vo/vo.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

FPS, DUR, SR = 30, 33.0, 24000
VOICE = "am_puck"

# phrase: (spoken, caption, speed, shift st, range x, melody, gain dB, pause after s)
#   shift: register vs the voice's own (+ = higher / more excited, - = lower / more serious)
#   range: how far the pitch swings around the phrase centre (1 = as Kokoro said it)
#   melody: rise (question), fall (statement lands), arch (hype), dip (aside / flat)
P = lambda spoken, cap=None, speed=1.12, shift=0, rng=1.5, mel="fall", gain=0, gap=0.12: dict(
    text=spoken, cap=cap or spoken, speed=speed, shift=shift, rng=rng, mel=mel, gain=gain, gap=gap)
# (start frame, latest end frame, phrases)
LINES = [
    (6, 86, [P("Yo!", speed=1.0, shift=4, rng=1.3, mel="fall", gain=2, gap=0.14),
             P("Still paying Shopify thirty-nine bucks a month?!", "Still paying Shopify $39 a month?!", speed=1.18, shift=1.5, rng=1.7, mel="rise")]),
    (92, 262, [P("That's four sixty-eight a year!", "That's $468 a year!", speed=1.12, shift=0.5, rng=1.6, mel="arch", gap=0.22),
               P("Forty-six eighty in ten years!", "$4,680 in ten years!", speed=1.05, shift=3, rng=1.8, mel="arch", gain=1.5, gap=0.32),
               P("And you still don't even own your store!", speed=1.1, shift=-1.5, rng=1.5, mel="fall")]),
    (280, 332, [P("So...", speed=0.95, shift=-2.5, rng=1.0, mel="dip", gain=-2, gap=0.22),
                P("what if you paid once?", speed=1.05, shift=-1, rng=1.6, mel="rise", gain=-1)]),
    (338, 476, [P("Boom!", speed=1.0, shift=4, rng=1.2, mel="fall", gain=3, gap=0.2),
                P("Shopify Killer!", speed=1.0, shift=3.5, rng=1.7, mel="arch", gain=2, gap=0.3),
                P("Not some boring template.", speed=1.15, shift=-2.5, rng=0.8, mel="dip", gain=-1.5, gap=0.16),
                P("A stunning store, with real animations!", speed=1.12, shift=2, rng=1.8, mel="arch", gain=1)]),
    (482, 522, [P("Way more beautiful!", speed=1.08, shift=1, rng=1.7, mel="arch")]),
    (527, 567, [P("Customize everything!", speed=1.1, shift=1, rng=1.7, mel="arch")]),
    (572, 612, [P("Full control!", speed=1.0, shift=-1, rng=1.4, mel="fall", gain=1)]),
    (617, 660, [P("Zero monthly fees!", speed=1.05, shift=2, rng=1.8, mel="arch", gain=2)]),
    (668, 776, [P("That's forty-three twenty saved!", "That's $4,320 saved!", speed=1.08, shift=2, rng=1.7, mel="arch", gain=1, gap=0.25),
                P("It pays for itself in ten months!", "It pays for itself in 10 months!", speed=1.12, shift=0, rng=1.5, mel="fall")]),
    (782, 868, [P("And if you don't love it?", speed=1.12, shift=-1, rng=1.5, mel="rise", gap=0.22),
                P("Full refund.", speed=1.0, shift=-2.5, rng=1.2, mel="fall", gap=0.16),
                P("Zero risk!", speed=1.0, shift=1, rng=1.5, mel="fall", gain=1.5)]),
    (872, 989, [P("D.M. or comment, Appify E-commerce,", "DM or comment \"Appify Ecommerce\"", speed=1.1, shift=1, rng=1.6, mel="arch", gap=0.12),
                P("to book your free prototype demo!", speed=1.12, shift=0.5, rng=1.7, mel="fall")]),
]


def smooth(a, b, u):
    x = np.clip((u - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)


def melody(kind, u):
    """pitch offset in semitones over normalised phrase time u (0..1)"""
    decl = -1.2 * u                                      # natural downdrift through a phrase
    if kind == "rise": return 0.6 * decl + 4.5 * smooth(0.6, 1, u)
    if kind == "arch": return decl + 2.0 * np.sin(np.pi * np.clip(u * 1.15, 0, 1)) - 1.5 * smooth(0.8, 1, u)
    if kind == "dip":  return decl - 1.0 * smooth(0.5, 1, u)
    return decl + 1.2 * np.sin(np.pi * np.clip(u * 1.6, 0, 1)) - 3.0 * smooth(0.65, 1, u)   # fall


def intonate(s, ph, stretch=1.0):
    snd = parselmouth.Sound(s, SR)
    man = call(snd, "To Manipulation", 0.01, 60, 450)
    pt = call(man, "Extract pitch tier")
    n = call(pt, "Get number of points")
    ts = np.array([call(pt, "Get time from index", i) for i in range(1, n + 1)])
    fs = np.array([call(pt, "Get value at index", i) for i in range(1, n + 1)])
    if n > 3:
        centre = np.median(fs)
        d = 12 * np.log2(fs / centre)
        u = (ts - ts[0]) / max(1e-6, ts[-1] - ts[0])
        st = ph["shift"] + ph["rng"] * d + melody(ph["mel"], u)
        new = call("Create PitchTier", "p", snd.xmin, snd.xmax)
        for t, v in zip(ts, centre * 2 ** (st / 12)):
            call(new, "Add point", float(t), float(np.clip(v, 65, 420)))
        call([new, man], "Replace pitch tier")
    if stretch != 1.0:
        dt = call("Create DurationTier", "d", snd.xmin, snd.xmax)
        call(dt, "Add point", snd.xmin, stretch); call(dt, "Add point", snd.xmax, stretch)
        call([dt, man], "Replace duration tier")
    out = call(man, "Get resynthesis (overlap-add)").values[0]
    return out * 10 ** (ph["gain"] / 20)


def tts(text, speed):
    s, sr = k.create(text, voice=VOICE, speed=speed, lang="en-us")
    nz = np.where(np.abs(s) > 0.01)[0]
    return s[max(0, nz[0] - 200): nz[-1] + 900]


def breath(dur=0.16):
    """soft inhale before a long line: band-limited noise with a swell"""
    n = int(dur * SR); rng = np.random.default_rng(7)
    x = np.convolve(rng.standard_normal(n), np.hanning(18) / 9, "same")
    x -= np.convolve(x, np.ones(40) / 40, "same")          # drop the rumble
    return x * np.sin(np.linspace(0, np.pi, n)) ** 1.5 * 0.012


def room(x):
    """tiny room so it sounds recorded, not pasted in"""
    n = int(0.22 * SR); rng = np.random.default_rng(3)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 9, n)); ir[0] = 0
    wet = np.convolve(x, ir / np.abs(ir).sum() * 6, "full")[: len(x)]
    return x + 0.09 * wet


k = Kokoro(f"{sys.argv[1]}/kokoro-v1.0.onnx", f"{sys.argv[1]}/voices-v1.0.bin")
out = np.zeros(int(DUR * SR)); words = []
for li, (start, end, phrases) in enumerate(LINES):
    budget = (end - start) / FPS
    raw = [tts(p["text"], p["speed"]) for p in phrases]
    total = sum(len(r) for r in raw) / SR + sum(p["gap"] for p in phrases[:-1])
    if total > budget:                                    # too long: speak a touch faster, keep the melody
        raw = [tts(p["text"], p["speed"] * min(1.18, total / budget)) for p in phrases]
        total = sum(len(r) for r in raw) / SR + sum(p["gap"] for p in phrases[:-1])
    stretch = min(1.0, budget / total) if total > budget else 1.0
    segs, marks = [], []
    lead = breath() if budget > 3 and li > 0 else np.zeros(0)
    pos = 0
    for p, r in zip(phrases, raw):
        y = intonate(r, p, stretch)
        segs.append(y); marks.append((pos, y, p)); pos += len(y)
        if p is not phrases[-1]:
            g = np.zeros(int(p["gap"] * stretch * SR)); segs.append(g); pos += len(g)
    line = np.concatenate(segs)
    i = int(start / FPS * SR)
    if len(lead): out[max(0, i - len(lead)): i] += lead[-min(i, len(lead)):]
    out[i:i + len(line)] += line[: len(out) - i]
    print(f"{start:4d} {len(line) / SR:5.2f}s / {budget:4.2f}s  stretch {stretch:.2f}  {phrases[0]['text'][:40]}")
    # word timings: spread each phrase's caption words over its voiced frames by word length
    for off, y, p in marks:
        env = np.convolve(np.abs(y), np.ones(480) / 480, "same")
        voiced = env > env.max() * 0.08
        vt = np.cumsum(voiced) / max(1, voiced.sum())
        cw = p["cap"].split()
        weights = np.array([max(2, len(w.strip('.,?!"\'$'))) + 1.5 for w in cw], float)
        edges = np.concatenate([[0], np.cumsum(weights) / weights.sum()])
        for j, w in enumerate(cw):
            a = np.searchsorted(vt, edges[j]); b = np.searchsorted(vt, edges[j + 1])
            words.append({"w": w, "line": li, "start": round(start + (off + a) / SR * FPS, 2), "end": round(start + (off + b) / SR * FPS, 2)})
out = room(out)
peak = np.abs(out).max(); out = out / peak * 0.9
sf.write("vo/vo.wav", out, SR)
# per-frame mouth envelope 0..1
hop = SR // FPS
rms = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2)) for i in range(int(DUR * FPS))])
env = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
json.dump({"mouth": [round(float(x), 3) for x in env], "words": words}, open("src/vo.json", "w"))
print("words", len(words))
