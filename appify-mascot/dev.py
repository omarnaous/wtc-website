"""Dev v2: Appify's mascot, drawn from the founder's look.
Slicked-back pompadour, full beard, clear octagonal glasses with blue lenses,
white camp-collar shirt with the Appify spark on the pocket.
Parts are separate groups so the Remotion rig can animate them (brows, lids, mouth, arms)."""
INK = "#0A0913"; IRIS = "#8F72FF"; UV = "#5B2BFF"
SKIN = "#E3AE86"; SKIN_D = "#C98F68"; HAIR = "#1B1512"; HAIR_L = "#3A2E28"; BEARD = "#221915"; SHIRT = "#F7F5EF"; SHIRT_D = "#E3DFD4"
S = 'stroke="#0A0913" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"'

def spark(cx, cy, R, k=0.22):
    q = R * k
    return (f"M{cx},{cy-R} C{cx+q},{cy-q} {cx+q},{cy-q} {cx+R},{cy} C{cx+q},{cy+q} {cx+q},{cy+q} {cx},{cy+R} "
            f"C{cx-q},{cy+q} {cx-q},{cy+q} {cx-R},{cy} C{cx-q},{cy-q} {cx-q},{cy-q} {cx},{cy-R} Z")

def octagon(cx, cy, w, h, c):
    x0, x1, y0, y1 = cx - w / 2, cx + w / 2, cy - h / 2, cy + h / 2
    return f"M{x0+c},{y0} H{x1-c} L{x1},{y0+c} V{y1-c} L{x1-c},{y1} H{x0+c} L{x0},{y1-c} V{y0+c} Z"

def body():
    g = f'<ellipse cx="300" cy="752" rx="170" ry="18" fill="rgba(10,9,19,.18)"/>'
    g += f'<rect x="236" y="640" width="56" height="96" rx="14" fill="#2B2733" {S}/><rect x="308" y="640" width="56" height="96" rx="14" fill="#2B2733" {S}/>'
    g += f'<path d="M212,728 h84 a14,14 0 0 1 0,22 h-88 a12,12 0 0 1 4,-22 Z" fill="#fff" {S}/><path d="M304,728 h84 a12,12 0 0 1 4,22 h-88 a14,14 0 0 1 0,-22 Z" fill="#fff" {S}/>'
    # shirt
    g += f'<path d="M150,660 Q140,500 210,450 L390,450 Q460,500 450,660 Z" fill="{SHIRT}" {S}/>'
    g += f'<path d="M270,452 L300,520 L330,452 Z" fill="{SKIN}" {S}/>'                       # open neck
    g += f'<path d="M262,446 L300,522 L252,500 L222,452 Z" fill="{SHIRT}" {S}/><path d="M338,446 L300,522 L348,500 L378,452 Z" fill="{SHIRT}" {S}/>'  # camp collar
    g += f'<line x1="300" y1="524" x2="300" y2="656" stroke="{SHIRT_D}" stroke-width="4"/>'
    g += "".join(f'<circle cx="300" cy="{y}" r="5" fill="{SHIRT_D}" stroke="{INK}" stroke-width="2"/>' for y in (548, 590, 632))
    g += f'<rect x="338" y="540" width="62" height="56" rx="6" fill="{SHIRT}" stroke="{INK}" stroke-width="4"/><path d="{spark(369,566,14)}" fill="{IRIS}"/>'
    # sleeves + forearms holding a tablet
    g += f'<path d="M160,500 Q120,540 132,600 L186,600 Q190,556 214,520 Z" fill="{SHIRT}" {S}/><path d="M440,500 Q480,540 468,600 L414,600 Q410,556 386,520 Z" fill="{SHIRT}" {S}/>'
    g += f'<path d="M142,598 Q150,650 210,660" fill="none" stroke="{INK}" stroke-width="40" stroke-linecap="round"/><path d="M142,598 Q150,650 210,660" fill="none" stroke="{SKIN}" stroke-width="26" stroke-linecap="round"/>'
    g += f'<path d="M458,598 Q450,650 390,660" fill="none" stroke="{INK}" stroke-width="40" stroke-linecap="round"/><path d="M458,598 Q450,650 390,660" fill="none" stroke="{SKIN}" stroke-width="26" stroke-linecap="round"/>'
    g += f'<rect x="200" y="606" width="200" height="110" rx="14" fill="#25212E" {S} transform="rotate(-4 300 660)"/>'
    g += f'<path d="{spark(300,660,20)}" fill="{IRIS}" transform="rotate(-4 300 660)"/>'
    g += f'<circle cx="208" cy="664" r="18" fill="{SKIN}" {S}/><circle cx="392" cy="660" r="18" fill="{SKIN}" {S}/>'
    return g

def head(brow_raise=10, lid=0.32, smile=1.0, look=6):
    g = f'<path d="M262,420 L262,456 Q300,470 338,456 L338,420 Z" fill="{SKIN_D}" {S}/>'   # neck
    g += f'<ellipse cx="154" cy="300" rx="22" ry="34" fill="{SKIN}" {S}/><ellipse cx="446" cy="300" rx="22" ry="34" fill="{SKIN}" {S}/>'
    g += f'<path d="M300,140 C390,140 452,204 448,300 C444,388 384,446 300,448 C216,446 156,388 152,300 C148,204 210,140 300,140 Z" fill="{SKIN}" {S}/>'
    # tapered sides
    g += f'<path d="M156,282 Q150,228 176,200 L186,250 Q166,262 156,282 Z" fill="{HAIR_L}" {S}/><path d="M444,282 Q450,228 424,200 L414,250 Q434,262 444,282 Z" fill="{HAIR_L}" {S}/>'
    # slicked-back pompadour
    g += f'<path d="M164,246 Q146,156 206,116 Q252,62 330,58 Q412,60 440,124 Q462,174 440,246 Q428,206 402,194 Q356,176 300,182 Q248,178 212,196 Q182,210 164,246 Z" fill="{HAIR}" {S}/>'
    g += f'<path d="M192,194 Q198,104 296,84 Q396,74 436,140 Q400,108 340,108 Q264,114 222,172 Z" fill="{HAIR_L}"/>'
    g += f'<path d="M214,164 Q256,100 336,86 M232,182 Q282,126 362,116 M258,188 Q312,148 392,146 M388,72 Q428,98 440,140" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="6" stroke-linecap="round"/>'
    # beard + moustache
    g += f'<path d="M154,290 Q150,382 198,424 Q244,474 300,478 Q356,474 402,424 Q450,382 446,290 Q438,340 418,364 Q390,388 362,382 Q332,372 300,374 Q268,372 238,382 Q210,388 182,364 Q162,340 154,290 Z" fill="{BEARD}" {S}/>'
    g += f'<path d="M248,390 Q274,370 300,380 Q326,370 352,390 Q328,398 300,393 Q272,398 248,390 Z" fill="{BEARD}" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>'
    mh = 10 + 14 * smile
    g += f'<path d="M266,402 Q300,{402 + mh * 1.5} 334,402 Q300,{406 + mh * 0.25} 266,402 Z" fill="#fff" stroke="{INK}" stroke-width="6" stroke-linejoin="round"/>'
    g += f'<path d="M292,330 Q300,350 290,356" fill="none" stroke="{SKIN_D}" stroke-width="6" stroke-linecap="round"/>'  # nose
    # eyes with confident half-lids
    for x in (240, 360):
        g += f'<ellipse cx="{x}" cy="302" rx="24" ry="20" fill="#fff" stroke="{INK}" stroke-width="5"/>'
        g += f'<circle cx="{x + look}" cy="305" r="10" fill="{INK}"/><circle cx="{x + look + 3}" cy="300" r="3" fill="#fff"/>'
        t = 282 + 38 * lid
        g += f'<path d="M{x-27},282 H{x+27} V{t} Q{x},{t + 5} {x-27},{t} Z" fill="{SKIN}"/>'
        g += f'<path d="M{x-25},{t} Q{x},{t + 5} {x+25},{t}" fill="none" stroke="{INK}" stroke-width="5" stroke-linecap="round"/>'

    # brows (right one raised)
    g += f'<path d="M208,252 Q240,240 272,250" fill="none" stroke="{HAIR}" stroke-width="16" stroke-linecap="round"/>'
    g += f'<path d="M328,{250 - brow_raise} Q360,{236 - brow_raise} 392,{248 - brow_raise * 0.4}" fill="none" stroke="{HAIR}" stroke-width="16" stroke-linecap="round"/>'
    # clear octagonal glasses, light-blue lenses
    for x in (240, 360):
        o = octagon(x, 302, 96, 74, 20)
        g += f'<path d="{o}" fill="rgba(140,200,255,.16)" stroke="{INK}" stroke-width="11"/>'
        g += f'<path d="{o}" fill="none" stroke="#E4ECF2" stroke-width="7"/>'
        g += f'<path d="M{x-30},{280} L{x-12},{272}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>'
    g += f'<path d="M288,296 Q300,286 312,296" fill="none" stroke="{INK}" stroke-width="10"/><path d="M288,296 Q300,286 312,296" fill="none" stroke="#E4ECF2" stroke-width="5"/>'
    g += f'<path d="M276,268 H324" stroke="{INK}" stroke-width="9" stroke-linecap="round"/><path d="M276,268 H324" stroke="#E4ECF2" stroke-width="4" stroke-linecap="round"/>'
    return g

def full(**kw):
    return body() + head(**kw)

if __name__ == "__main__":
    poses = [("Friendly", dict(brow_raise=8, lid=0.0, smile=0.8, look=0)),
             ("Persuading", dict(brow_raise=20, lid=0.18, smile=1.0, look=7)),
             ("Unimpressed", dict(brow_raise=0, lid=0.55, smile=0.0, look=-6))]
    html = '''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;font-weight:600;src:url(../appify-kinetic/public/Sora-600.ttf)}@font-face{font-family:M;src:url(../appify-kinetic/public/GeistMono-500.ttf)}
body{margin:0;background:#E9E6F2;font-family:D;width:1980px}.row{display:flex;gap:30px;padding:30px}
.c{background:#F3F1FA;border-radius:24px;overflow:hidden}.art{background-image:radial-gradient(rgba(91,43,255,.22) 2px,transparent 2px);background-size:28px 28px}
.t{padding:16px 28px 24px}.k{font-family:M;font-size:15px;letter-spacing:.16em;color:#6D6788}.n{font-size:36px;letter-spacing:-.03em;margin-top:6px;color:#0A0913}
</style></head><body><div class="row">'''
    html += f'<div class="c" style="width:700px"><div class="art"><svg viewBox="90 50 420 720" width="700" height="1200">{full(**poses[1][1])}</svg></div><div class="t"><div class="k">DEV · v2</div><div class="n">Appify founder mascot</div></div></div>'
    html += '<div style="display:grid;gap:30px">'
    for n, kw in poses:
        html += f'<div class="c" style="width:560px;display:flex"><div class="art"><svg viewBox="130 50 340 440" width="300" height="388">{head(**kw)}</svg></div><div class="t" style="align-self:center"><div class="k">EXPRESSION</div><div class="n">{n}</div></div></div>'
    html += '</div></div></body></html>'
    open("dev.html", "w").write(html)
