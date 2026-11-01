#!/usr/bin/env python3
"""A real-audio library for reels: Mixkit music (Mixkit Stock Music Free License) and sound effects (Mixkit Sound
Effects Free License); both allow use in commercial videos without attribution, but not re-selling or sharing the
files on their own, so the audio stays out of git (only catalog.json and used.json are committed).

  build                      download the library (music grouped by mood, effects by category) into LIB, write catalog.json
  moods                      list moods/genres and how many tracks each has
  pick-music --mood M [--min-bpm A --max-bpm B --project P]
                             pick an unused track for that mood, print it (and log it under P in used.json)
  bed ID OUT.wav --dur S [--start S] [--fade 1.2] [--gain 0.8]
                             cut a music bed: ID from `start` (default: the first downbeat after 20% of the track),
                             `dur` seconds, fades, 48 kHz stereo WAV
  sfx TAG [--n 5] [--project P] [--max-dur 3] [--exclude game,arcade,cartoon] [--title REGEX]
                             print N effect files for a tag, rotating so a project never reuses one
  beats ID                   print the track's BPM and the time of its first beat (to lock cuts to the music)

LIB defaults to <wtc-website>/sound-library (else ~/sound-library; env SOUND_LIB overrides). Rules for every video: never reuse a music track another project used
(pick-music excludes them), and use at least 4 different effect files; vary the effect per repeated event.
"""
import argparse, html, json, os, random, re, subprocess, sys, time, urllib.request

_REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../../.."))   # wtc-website, when run from this skill
LIB = os.path.expanduser(os.environ.get("SOUND_LIB", os.path.join(_REPO, "sound-library") if os.path.isdir(os.path.join(_REPO, ".git")) else "~/sound-library"))
UA = {"User-Agent": "Mozilla/5.0"}
MOODS = {
    "gym-energy": ["hip-hop", "drum-and-bass", "dubstep", "edm", "electro-house", "breakbeat", "grime", "hard-rock", "nu-metal", "percussion-trailer"],
    "premium-fashion": ["deep-house", "house", "chillout", "lounge", "downtempo", "electronica", "minimalism", "neo-soul"],
    "tech-corporate": ["corporate-music", "electronic", "electropop", "rhythmic-underscore", "future-bass"],
    "pop-upbeat": ["pop", "dance-pop", "indie-pop", "funk", "disco", "latin-pop", "reggaeton", "moombahton"],
    "cinematic": ["cinematic", "orchestral-hybrid", "film-score", "ambient", "atmospheres"],
    "chill-lofi": ["lo-fi-beats", "dream-pop", "acid-jazz"],
}
SFX = ["whoosh", "woosh", "swoosh", "swish", "transition", "sweep", "swell", "zoom", "rewind", "impact", "hit", "punch",
       "thud", "boom", "bass", "drop", "stomp", "cinematic", "intro", "glitch", "static", "high-tech", "technology",
       "interface", "click", "tap", "pop", "bubbles", "notification", "alerts", "ding", "chimes", "bell", "sparkle",
       "magic", "correct", "wrong", "error", "win", "lose", "game", "arcade", "coin", "money", "casino", "camera",
       "typewriter", "keyboard", "type", "phone", "applause", "cheer", "crowd", "countdown", "beep", "buzzer", "laser",
       "sci-fi", "slide", "paper", "page", "write", "metal", "athletics", "boxing", "sports", "heartbeat", "breathe",
       "drum", "cymbal", "dj-record-scratch", "wow", "funny", "cartoon", "fight", "lock", "light"]
PER_GENRE, MUSIC_SECONDS = 4, 150

def get(url, tries=3):
    for k in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
        except Exception as e:
            if k == tries - 1: raise
            time.sleep(2 * (k + 1))

def load(name, default):
    p = os.path.join(LIB, name)
    return json.load(open(p)) if os.path.exists(p) else default
def save(name, obj):
    json.dump(obj, open(os.path.join(LIB, name), "w"), indent=1, ensure_ascii=False)

def tempo(path):
    """BPM and first-beat time from an onset envelope (numpy autocorrelation; good to ~1 BPM on steady tracks)."""
    import numpy as np
    sr = 11025
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-t", "60", "-ac", "1", "-ar", str(sr), "-f", "f32le", "-"], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    if len(x) < sr * 8: return None, None
    hop = 256; n = len(x) // hop
    e = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) for i in range(n)])
    on = np.maximum(0, np.diff(np.log1p(e * 100), prepend=0))
    on -= on.mean()
    ac = np.correlate(on, on, "full")[len(on) - 1:]
    fps = sr / hop
    lags = np.arange(len(ac)) / fps
    ok = (lags >= 60 / 180) & (lags <= 60 / 70)
    lag = np.argmax(np.where(ok, ac, -1e9))
    bpm = 60 / (lag / fps)
    period = lag
    phases = [on[p::period][: int(len(on) / period)].sum() for p in range(period)]
    first = int(np.argmax(phases)) / fps
    return round(float(bpm), 1), round(float(first), 3)

def build(a):
    os.makedirs(f"{LIB}/music", exist_ok=True); os.makedirs(f"{LIB}/sfx", exist_ok=True)
    cat = load("catalog.json", {"music": [], "sfx": []})
    have_m = {m["id"] for m in cat["music"]}; have_s = {s["id"] for s in cat["sfx"]}
    for mood, genres in MOODS.items():
        for g in genres:
            try: h = get(f"https://mixkit.co/free-stock-music/{g}/").decode("utf8", "ignore")
            except Exception as e: print("skip", g, e); continue
            recs = []
            for m in re.finditer(r'"@type":"MusicRecording","name":"(.*?)","genre":"(.*?)","byArtist":"(.*?)","duration":"PT(?:(\d+)M)?(\d+)S","url":"(https://assets\.mixkit\.co/music/(\d+)/\d+\.mp3)"', h):
                name, genre, artist, mm, ss, url, mid = m.groups()
                dur = int(mm or 0) * 60 + int(ss)
                if dur >= 40: recs.append(dict(id=f"m{mid}", title=html.unescape(name), artist=artist, genre=genre, page=g, mood=mood, duration=dur, url=url))
            seen = 0
            for r in recs:
                if seen >= PER_GENRE: break
                if r["id"] in have_m: seen += 1; continue
                out = f"{LIB}/music/{r['id']}.mp3"
                try:
                    tmp = out + ".src.mp3"; open(tmp, "wb").write(get(r["url"]))
                    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-t", str(MUSIC_SECONDS), "-b:a", "128k", out], check=True); os.remove(tmp)
                    r["bpm"], r["first_beat"] = tempo(out)
                    r["file"] = f"music/{r['id']}.mp3"; r["license"] = "Mixkit Stock Music Free License"
                    cat["music"].append(r); have_m.add(r["id"]); seen += 1
                    print(f"music {mood:16s} {g:20s} {r['title'][:30]:30s} {r['bpm']} bpm", flush=True)
                except Exception as e: print("fail", r["url"], e)
                time.sleep(0.3)
            save("catalog.json", cat)
    for tag in SFX:
        try: h = get(f"https://mixkit.co/free-sound-effects/{tag}/").decode("utf8", "ignore")
        except Exception as e: print("skip", tag, e); continue
        for card in h.split('data-test-id="audio-player"')[1:]:
            u = re.search(r'preview-url-value="(https://assets\.mixkit\.co/active_storage/sfx/(\d+)/\d+-preview\.mp3)"', card)
            t = re.search(r'item-grid-card__title">\s*(.*?)\s*</h2>', card, re.S)
            d = re.search(r'data-test-id="duration">\s*(\d+):(\d+)', card)
            if not u: continue
            sid = f"s{u.group(2)}"
            tags = sorted(set(re.findall(r'href="/free-sound-effects/([a-z0-9-]+)/"', card)) | {tag})
            if sid in have_s:
                for s in cat["sfx"]:
                    if s["id"] == sid: s["tags"] = sorted(set(s["tags"]) | set(tags))
                continue
            out = f"{LIB}/sfx/{sid}.mp3"
            try:
                open(out, "wb").write(get(u.group(1)))
                cat["sfx"].append(dict(id=sid, title=html.unescape(t.group(1)) if t else sid, tags=tags,
                                       duration=(int(d.group(1)) * 60 + int(d.group(2))) if d else None, file=f"sfx/{sid}.mp3",
                                       license="Mixkit Sound Effects Free License"))
                have_s.add(sid)
            except Exception as e: print("fail", u.group(1), e)
            time.sleep(0.15)
        print(f"sfx {tag:18s} total {len(cat['sfx'])}", flush=True)
        save("catalog.json", cat)
    print("done", len(cat["music"]), "tracks,", len(cat["sfx"]), "effects")

def moods(a):
    cat = load("catalog.json", {"music": []}); used = load("used.json", {})
    usedset = {t for v in used.values() for t in v.get("music", [])}
    for mood in MOODS:
        ts = [m for m in cat["music"] if m["mood"] == mood]
        print(f"{mood:16s} {len(ts):3d} tracks ({sum(1 for m in ts if m['id'] not in usedset)} unused) · " + ", ".join(sorted({m['page'] for m in ts})))

def pick_music(a):
    cat = load("catalog.json", {"music": []}); used = load("used.json", {})
    usedset = {t for v in used.values() for t in v.get("music", [])}
    ts = [m for m in cat["music"] if m["mood"] == a.mood and m["id"] not in usedset and m.get("bpm")
          and (a.min_bpm is None or m["bpm"] >= a.min_bpm) and (a.max_bpm is None or m["bpm"] <= a.max_bpm)]
    if not ts: sys.exit(f"no unused track for mood {a.mood} in that BPM range")
    m = random.Random(a.seed).choice(ts)
    if a.project:
        used.setdefault(a.project, {}).setdefault("music", []).append(m["id"]); save("used.json", used)
    print(json.dumps({k: m[k] for k in ("id", "title", "artist", "genre", "bpm", "first_beat", "duration", "file")}, ensure_ascii=False))

def bed(a):
    cat = load("catalog.json", {"music": []})
    m = next(x for x in cat["music"] if x["id"] == a.id)
    start = a.start
    if start is None:   # the first downbeat (every 4 beats) after 20% into the track: past the intro, on the grid
        beat = 60 / m["bpm"]; t0 = m["duration"] * 0.2
        k = max(0, int((t0 - m["first_beat"]) / (4 * beat)) + 1); start = m["first_beat"] + k * 4 * beat
    start = min(start, max(0, min(m["duration"], 150) - a.dur))
    af = f"afade=t=in:st=0:d=0.05,afade=t=out:st={max(0, a.dur - a.fade):.3f}:d={a.fade},volume={a.gain}"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{start:.3f}", "-i", f"{LIB}/{m['file']}", "-t", f"{a.dur:.3f}",
                    "-af", af, "-ar", "48000", "-ac", "2", a.out], check=True)
    print(json.dumps({"id": m["id"], "title": m["title"], "artist": m["artist"], "start": round(start, 3), "bpm": m["bpm"],
                      "beat_frames_30fps": round(30 * 60 / m["bpm"], 2)}, ensure_ascii=False))

def sfx(a):
    cat = load("catalog.json", {"sfx": []}); used = load("used.json", {})
    pu = set(used.get(a.project, {}).get("sfx", [])) if a.project else set()
    ex = set(filter(None, (a.exclude or "").split(",")))
    ss = [s for s in cat["sfx"] if a.tag in s["tags"] and (s["duration"] or 0) <= a.max_dur and not ex & set(s["tags"])
          and not any(w in s["title"].lower() for w in ex) and (not a.title or re.search(a.title, s["title"], re.I))]
    random.Random(a.seed).shuffle(ss)
    ss = sorted(ss, key=lambda s: s["id"] in pu)[: a.n]
    if a.project:
        used.setdefault(a.project, {}).setdefault("sfx", []).extend(s["id"] for s in ss if s["id"] not in pu); save("used.json", used)
    for s in ss: print(f"{LIB}/{s['file']}\t{s['title']}\t{s['duration']}s\t{','.join(s['tags'])}")

def beats(a):
    m = next(x for x in load("catalog.json", {"music": []})["music"] if x["id"] == a.id)
    print(json.dumps({"bpm": m["bpm"], "first_beat": m["first_beat"], "frames_per_beat_30fps": round(1800 / m["bpm"], 2)}))

if __name__ == "__main__":
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter); sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("build").set_defaults(fn=build); sub.add_parser("moods").set_defaults(fn=moods)
    q = sub.add_parser("pick-music"); q.add_argument("--mood", required=True); q.add_argument("--min-bpm", type=float); q.add_argument("--max-bpm", type=float); q.add_argument("--project"); q.add_argument("--seed", type=int); q.set_defaults(fn=pick_music)
    q = sub.add_parser("bed"); q.add_argument("id"); q.add_argument("out"); q.add_argument("--dur", type=float, required=True); q.add_argument("--start", type=float); q.add_argument("--fade", type=float, default=1.2); q.add_argument("--gain", type=float, default=0.8); q.set_defaults(fn=bed)
    q = sub.add_parser("sfx"); q.add_argument("tag"); q.add_argument("--n", type=int, default=5); q.add_argument("--project"); q.add_argument("--max-dur", type=float, default=3); q.add_argument("--seed", type=int)
    q.add_argument("--exclude", help="comma list of tags/title words to skip, e.g. game,arcade,cartoon,toy,8-bit"); q.add_argument("--title", help="regex the title must match"); q.set_defaults(fn=sfx)
    q = sub.add_parser("beats"); q.add_argument("id"); q.set_defaults(fn=beats)
    a = p.parse_args(); a.fn(a)
