# Put real Darebni AI screens into Apple's official iPhone 18 Pro bezel (screen opening 1206x2622 at 72,69), with a clean
# status bar (9:41, full signal, full Wi-Fi, full battery) as Apple's marketing guidelines require. Bezel untouched.
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
B = sys.argv[1]; OUT = sys.argv[2]; SCR = sys.argv[3:]
bez = Image.open(B).convert("RGBA")
font = ImageFont.truetype("/usr/share/fonts/opentype/inter/Inter-SemiBold.otf", 50)
W, H, X, Y = 1206, 2622, 72, 69
def statusbar(im):
    a = np.array(im.convert("RGB")).astype(float)
    band = 205                                # paint the status-bar strip, feathered into the screen from 160 down
    L = a[8:118, 20:200].reshape(-1, 3).mean(0); R = a[8:118, 1000:1190].reshape(-1, 3).mean(0)
    grad = np.linspace(0, 1, W)[None, :, None]; fill = (L * (1 - grad) + R * grad).repeat(band, 0)
    k = np.clip((np.arange(band) - 160) / 45, 0, 1)[:, None, None]
    a[:band] = fill * (1 - k) + a[:band] * k
    out = Image.fromarray(a.astype(np.uint8)); d = ImageDraw.Draw(out)
    ink = (0, 0, 0) if (L.mean() + R.mean()) / 2 > 128 else (255, 255, 255)
    cy = 98
    d.text((150, cy), "9:41", font=font, fill=ink, anchor="mm")
    x = 900                                   # signal: 4 full bars
    for i, h in enumerate([14, 20, 27, 34]): d.rounded_rectangle([x + i * 13, cy + 17 - h, x + i * 13 + 9, cy + 17], 2.5, fill=ink)
    wx, wy = 990, cy + 15                     # wifi: 3 arcs + dot
    for r in (36, 25, 14): d.pieslice([wx - r, wy - r, wx + r, wy + r], 225, 315, fill=ink); d.pieslice([wx - r + 7, wy - r + 7, wx + r - 7, wy + r - 7], 225, 315, fill=tuple(fill[0, int(wx)].astype(int)))
    d.pieslice([wx - 7, wy - 7, wx + 7, wy + 7], 225, 315, fill=ink)
    bx = 1040                                 # battery: full
    d.rounded_rectangle([bx, cy - 16, bx + 62, cy + 16], 9, outline=ink, width=3)
    d.rounded_rectangle([bx + 6, cy - 10, bx + 56, cy + 10], 5, fill=ink)
    d.rounded_rectangle([bx + 66, cy - 6, bx + 71, cy + 6], 2, fill=ink)
    return out
for p in SCR:
    s = Image.open(p).convert("RGB").resize((W, H), Image.LANCZOS)
    s = statusbar(s)
    canvas = Image.new("RGBA", bez.size, (0, 0, 0, 0))
    mask = Image.new("L", (W, H), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, W - 1, H - 1], 170, fill=255)
    canvas.paste(s, (X, Y), mask)
    canvas.alpha_composite(bez)
    name = p.split("/")[-1].rsplit(".", 1)[0]
    canvas.save(f"{OUT}/{name}.png"); print(name)
