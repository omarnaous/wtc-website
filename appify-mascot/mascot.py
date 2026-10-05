"""Dev, Appify's mascot. Vector parts for animation; run to render hair options."""
INK="#0A0913"; UV="#5B2BFF"; IRIS="#8F72FF"; PAPER="#F3F1FA"
S='stroke="#0A0913" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"'
H="#1C1830"; H2="#2E2848"; HL="rgba(255,255,255,.2)"
def spark(cx,cy,R,k=0.2):
    q=R*k
    return (f"M{cx},{cy-R} C{cx+q},{cy-q} {cx+q},{cy-q} {cx+R},{cy} C{cx+q},{cy+q} {cx+q},{cy+q} {cx},{cy+R} "
            f"C{cx-q},{cy+q} {cx-q},{cy+q} {cx-R},{cy} C{cx-q},{cy-q} {cx-q},{cy-q} {cx},{cy-R} Z")
SIDES=f'''<path d="M154,290 Q144,236 168,210 L180,252 Q162,264 154,290 Z" fill="{H2}" {S}/>
<path d="M446,284 Q456,232 432,208 L420,250 Q438,260 446,284 Z" fill="{H2}" {S}/>'''
HAIR={
 "Swept quiff": SIDES + f'''
<path d="M158,258 Q150,196 196,164 Q216,118 266,108 Q296,80 336,86 Q380,80 406,110 Q444,126 436,168 Q454,204 444,258 Q430,218 396,208 Q402,186 378,174 Q346,196 300,192 Q254,188 224,206 Q186,216 158,258 Z" fill="{H}" {S}/>
<path d="M226,196 Q238,138 300,124 Q364,112 404,148 Q374,136 342,142 Q304,150 272,184 Z" fill="{H2}"/>
<path d="M250,150 Q290,118 340,112 M262,176 Q300,146 352,140 M380,104 Q410,120 418,150" fill="none" stroke="{HL}" stroke-width="7" stroke-linecap="round"/>''',
 "Middle-part curtains": f'''
<path d="M152,292 Q136,148 300,116 Q464,148 448,292 Q438,236 412,214 Q374,196 342,218 Q320,184 300,152 Q280,184 258,218 Q226,196 188,214 Q162,236 152,292 Z" fill="{H}" {S}/>
<path d="M300,124 L300,152 M232,150 Q262,176 258,214 M368,150 Q338,176 342,216" fill="none" stroke="{HL}" stroke-width="7" stroke-linecap="round"/>''',
 "Short curls": SIDES + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{H}" {S}/>' for x,y,r in [
   (190,212,24),(214,184,26),(246,162,27),(282,148,28),(320,146,28),(356,156,27),(388,178,26),(412,206,24),
   (236,196,22),(270,182,23),(306,178,23),(342,186,23),(374,202,21),(262,124,22),(300,116,23),(338,126,22),(224,144,20),(374,140,20)])
   + "".join(f'<path d="M{x-9},{y-4} q9,-9 18,0" fill="none" stroke="{HL}" stroke-width="5" stroke-linecap="round"/>' for x,y in [(282,144),(320,142),(246,158),(356,152),(300,112),(270,178),(342,182)]),
}
def dev(hair):
    skin="#F2C7A0"
    g=f'<ellipse cx="300" cy="740" rx="150" ry="18" fill="rgba(10,9,19,.18)"/>'
    g+=f'<path d="M160,640 Q150,470 230,430 L370,430 Q450,470 440,640 Z" fill="{UV}" {S}/>'
    g+=f'<path d="M232,432 Q300,500 368,432" fill="#3A1BB0" {S}/>'
    g+=f'<circle cx="300" cy="290" r="150" fill="{skin}" {S}/>'
    g+=f'<ellipse cx="152" cy="300" rx="22" ry="34" fill="{skin}" {S}/><ellipse cx="448" cy="300" rx="22" ry="34" fill="{skin}" {S}/>'
    g+=HAIR[hair]
    for x in (240,360):
        g+=f'<rect x="{x-56}" y="250" width="112" height="86" rx="30" fill="#fff" stroke="{INK}" stroke-width="10"/>'
        g+=f'<circle cx="{x+8}" cy="302" r="11" fill="{INK}"/>'
        g+=f'<path d="M{x-50},256 H{x+50} V{288} Q{x},300 {x-50},{288} Z" fill="{skin}"/>'
        g+=f'<path d="M{x-48},288 Q{x},300 {x+48},288" fill="none" stroke="{INK}" stroke-width="7" stroke-linecap="round"/>'
        g+=f'<rect x="{x-56}" y="250" width="112" height="86" rx="30" fill="none" stroke="{INK}" stroke-width="10"/>'
    g+=f'<line x1="296" y1="290" x2="304" y2="290" stroke="{INK}" stroke-width="10"/>'
    g+=f'<path d="M232,236 L272,244" {S}/><path d="M328,246 L370,238" {S}/>'
    g+=f'<path d="M272,382 Q302,374 330,384" fill="none" {S}/>'
    return g
if __name__ == "__main__":
    html='''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:D;font-weight:600;src:url(../appify-kinetic/public/Sora-600.ttf)}@font-face{font-family:M;src:url(../appify-kinetic/public/GeistMono-500.ttf)}
body{margin:0;background:#E9E6F2;font-family:D;width:1980px}.row{display:flex;gap:30px;padding:30px}
.c{width:620px;background:#F3F1FA;border-radius:24px;overflow:hidden}.art{background-image:radial-gradient(rgba(91,43,255,.22) 2px,transparent 2px);background-size:28px 28px}
.t{padding:18px 30px 26px}.k{font-family:M;font-size:15px;letter-spacing:.16em;color:#6D6788}.n{font-size:40px;letter-spacing:-.03em;margin-top:6px;color:#0A0913}
</style></head><body><div class="row">'''
    for i,h in enumerate(HAIR):
        html+=f'<div class="c"><div class="art"><svg viewBox="100 50 400 420" width="620" height="651">{dev(h)}</svg></div><div class="t"><div class="k">HAIR {i+1}</div><div class="n">{h}</div></div></div>'
    open('hair.html','w').write(html+'</div></body></html>')
