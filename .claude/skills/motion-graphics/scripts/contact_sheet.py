#!/usr/bin/env python3
"""Tile rendered stills into one review image.
usage: contact_sheet.py <dir-or-glob> <out.png> [--cols 6] [--width 320]
Frames are sorted by the number in their filename (e.g. Main-f84.png) and labelled with it."""
import sys, glob, os, re, argparse
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser(); ap.add_argument("src"); ap.add_argument("out")
ap.add_argument("--cols", type=int, default=6); ap.add_argument("--width", type=int, default=320)
a = ap.parse_args()
files = sorted(glob.glob(os.path.join(a.src, "*.png")) if os.path.isdir(a.src) else glob.glob(a.src),
               key=lambda p: (re.sub(r"-f\d+\.png$", "", os.path.basename(p)), int((re.findall(r"(\d+)\.png$", p) or [0])[-1])))
files = [f for f in files if os.path.abspath(f) != os.path.abspath(a.out)]
if not files: sys.exit("no PNGs found")
ims = [Image.open(f).convert("RGB") for f in files]
w = a.width; h = max(int(w * im.height / im.width) for im in ims)
cols = min(a.cols, len(ims)); rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (cols * (w + 8) + 8, rows * (h + 30) + 8), "#222")
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = 8 + (i % cols) * (w + 8), 8 + (i // cols) * (h + 30)
    sheet.paste(im.resize((w, int(w * im.height / im.width))), (x, y))
    d.text((x, y + h + 6), os.path.basename(f), fill="#ddd")
sheet.save(a.out); print(f"wrote {a.out} ({len(ims)} frames)")
