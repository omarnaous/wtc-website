"""Voice-over for the Fee Killer reel: one continuous read of the full script, and the video follows it.
Kokoro TTS (voice am_puck) speaks each sentence; Praat PSOLA re-intonates it (register, pitch range,
melody, loudness) so it isn't one flat tone. Sentences are joined with natural pauses only.
Scene starts are then placed on the voice (each scene starts `lead` frames before its first line,
and is held at least `min` frames so its animation can play), and written to src/vo.json with the
word timings and mouth envelope. timing.js, Presenter.jsx and sound/retime.py all read from it.
usage: python3 vo/vo.py <kokoro-dir>"""
import json, sys, numpy as np, soundfile as sf
import parselmouth
from parselmouth.praat import call
from kokoro_onnx import Kokoro

FPS, SR = 30, 24000
VOICE = "am_puck"
GAP_SENTENCE, GAP_SCENE = 0.2, 0.3      # seconds of silence between sentences / between scenes
TAIL = 60                              # frames the end card holds after the last word

# sentence: (spoken, caption, speed, shift st, range x, melody, gain dB)
#   shift: register vs the voice's own (+ = higher / more excited, - = lower / more serious)
#   range: how far the pitch swings around the sentence centre (1 = as Kokoro said it)
#   melody: rise (question), fall (statement lands), arch (hype), dip (aside / flat)
P = lambda spoken, cap=None, speed=1.1, shift=0, rng=1.5, mel="fall", gain=0: dict(
    text=spoken, cap=cap or spoken, speed=speed, shift=shift, rng=rng, mel=mel, gain=gain)
# (scene anchor, its frame in the original 33 s cut, lead frames before the voice, min frames, sentences)
SCRIPT = [
    ("receipt", 0, 6, 75, [P("Yo! Still paying thirty-nine bucks a month for your store?!", "Yo! Still paying $39 a month for your store?!", speed=1.12, shift=1.5, rng=1.6, mel="rise", gain=1)]),
    ("cost", 90, 2, 120, [P("That's four sixty-eight a year!", "That's $468 a year!", shift=0.5, rng=1.6, mel="arch"),
                          P("Forty-six eighty in ten years!", "$4,680 in ten years!", speed=1.05, shift=2.5, rng=1.8, mel="arch", gain=1.5),
                          P("And you still don't even own your store!", shift=-1.5, rng=1.5, mel="fall")]),
    ("turn", 270, 10, 60, [P("So... what if you paid once?", speed=1.0, shift=-1.5, rng=1.6, mel="rise", gain=-1)]),
    ("reveal", 330, 8, 140, [P("Boom! Fee Killer!", speed=1.02, shift=3.5, rng=1.6, mel="arch", gain=2.5),
                             P("Not some boring template.", speed=1.12, shift=-2.5, rng=0.8, mel="dip", gain=-1.5),
                             P("A stunning store, with real animations!", shift=2, rng=1.8, mel="arch", gain=1)]),
    ("feat0", 480, 2, 30, [P("Way more beautiful!", speed=1.08, shift=1, rng=1.7, mel="arch")]),
    ("feat1", 525, 2, 30, [P("Customize everything!", shift=1, rng=1.7, mel="arch")]),
    ("feat2", 570, 2, 30, [P("Full control!", speed=1.0, shift=-1, rng=1.4, mel="fall", gain=1)]),
    ("feat3", 615, 2, 42, [P("Zero monthly fees!", speed=1.05, shift=2, rng=1.8, mel="arch", gain=2)]),
    ("compare", 660, 8, 90, [P("That's forty-three twenty saved!", "That's $4,320 saved!", speed=1.08, shift=2, rng=1.7, mel="arch", gain=1),
                             P("It pays for itself in ten months!", "It pays for itself in 10 months!", shift=0, rng=1.5, mel="fall")]),
    ("guarantee", 780, 2, 80, [P("And if you don't love it?", shift=-1, rng=1.5, mel="rise"),
                               P("Full refund. Zero risk!", speed=1.0, shift=-1, rng=1.4, mel="fall", gain=1)]),
    ("offer", 870, 2, 120, [P("D.M. or comment, Appify L.B. E-commerce, to book your free prototype demo!", "DM or comment \"appifylb Ecommerce\" to book your free prototype demo!", shift=0.5, rng=1.6, mel="fall")]),
]
OLD_END = 990


def smooth(a, b, u):
    x = np.clip((u - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)


def melody(kind, u):
    """pitch offset in semitones over normalised phrase time u (0..1)"""
    decl = -1.2 * u                                      # natural downdrift through a phrase
    if kind == "rise": return 0.6 * decl + 4.5 * smooth(0.6, 1, u)
    if kind == "arch": return decl + 2.0 * np.sin(np.pi * np.clip(u * 1.15, 0, 1)) - 1.5 * smooth(0.8, 1, u)
    if kind == "dip":  return decl - 1.0 * smooth(0.5, 1, u)
    return decl + 1.2 * np.sin(np.pi * np.clip(u * 1.6, 0, 1)) - 3.0 * smooth(0.65, 1, u)   # fall


def intonate(s, ph):
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
F = lambda s: int(round(s * FPS))
# 1. speak every sentence
lines = []
for name, old, lead, mn, sents in SCRIPT:
    lines.append([intonate(tts(p["text"], p["speed"]), p) for p in sents])
# 2. place scenes on the voice: next scene starts when the voice is ready for it, but not before
#    the current scene's minimum length
anchors, starts, voice_free, prev = [], [], 0.0, None
for (name, old, lead, mn, sents), ys in zip(SCRIPT, lines):
    a = 0 if prev is None else max(F(voice_free + GAP_SCENE) - lead, prev[0] + prev[1])
    anchors.append([name, old, a]); starts.append(a + lead); prev = (a, mn)
    voice_free = (a + lead) / FPS + sum(len(y) for y in ys) / SR + GAP_SENTENCE * (len(ys) - 1)
total = max(F(voice_free) + TAIL, anchors[-1][2] + SCRIPT[-1][3])
# 3. lay the audio down and time every caption word
out = np.zeros(int(total / FPS * SR) + SR); words = []
for li, ((name, old, lead, mn, sents), ys, s0) in enumerate(zip(SCRIPT, lines, starts)):
    pos = int(s0 / FPS * SR)
    if sum(len(y) for y in ys) / SR > 3:
        b = breath(); out[max(0, pos - len(b)): pos] += b[-min(pos, len(b)):]
    for p, y in zip(sents, ys):
        out[pos:pos + len(y)] += y
        env = np.convolve(np.abs(y), np.ones(480) / 480, "same")
        voiced = env > env.max() * 0.08
        vt = np.cumsum(voiced) / max(1, voiced.sum())
        cw = p["cap"].split()
        weights = np.array([max(2, len(w.strip('.,?!"\'$'))) + 1.5 for w in cw], float)
        edges = np.concatenate([[0], np.cumsum(weights) / weights.sum()])
        for j, w in enumerate(cw):
            a = np.searchsorted(vt, edges[j]); b2 = np.searchsorted(vt, edges[j + 1])
            words.append({"w": w, "line": li, "start": round((pos + a) / SR * FPS, 2), "end": round((pos + b2) / SR * FPS, 2)})
        pos += len(y) + int(GAP_SENTENCE * SR)
    print(f"{name:10s} scene {anchors[li][2]:4d} (was {old:4d})  voice {s0:4d}  {sents[0]['text'][:44]}")
out = out[: int(total / FPS * SR)]
out = room(out)
out = out / np.abs(out).max() * 0.9
sf.write("vo/vo.wav", out, SR)
hop = SR // FPS
rms = np.array([np.sqrt(np.mean(out[i * hop:(i + 1) * hop] ** 2)) for i in range(total)])
env = np.clip(rms / (np.percentile(rms[rms > 0.01], 90) + 1e-9), 0, 1)
anchors.append(["end", OLD_END, total])
json.dump({"duration": total, "anchors": anchors, "mouth": [round(float(x), 3) for x in env], "words": words}, open("src/vo.json", "w"))
print(f"total {total} frames = {total / FPS:.2f}s, words {len(words)}")
