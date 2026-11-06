# Darebni highlight covers: 1080x1920, ink + violet glow + grid (the reels' look), one icon centred inside the area that
# survives Instagram's circular crop (centre ~640 px).
import sys
O = sys.argv[1]
V, VL, P, INK = "#5B4EE5", "#8B80FF", "#F2F0EA", "#07071A"
st = f'fill="none" stroke="{P}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"'
ICONS = {
  "1-start-here": f'<rect x="-95" y="-170" width="190" height="340" rx="38" {st}/><rect x="-36" y="-142" width="72" height="20" rx="10" fill="{P}"/><path d="M-30,30 L30,70 L-30,110 Z" fill="{VL}"/>',
  "2-proof": f'<path d="M0,-165 L48,-58 L165,-50 L76,28 L104,145 L0,82 L-104,145 L-76,28 L-165,-50 L-48,-58 Z" fill="{VL}" stroke="{P}" stroke-width="18" stroke-linejoin="round"/>',
  "3-workouts": f'<rect x="-210" y="-26" width="420" height="52" rx="14" fill="{P}"/><rect x="-170" y="-110" width="48" height="220" rx="16" fill="{VL}"/><rect x="-118" y="-80" width="36" height="160" rx="12" fill="{VL}"/><rect x="122" y="-110" width="48" height="220" rx="16" fill="{VL}"/><rect x="82" y="-80" width="36" height="160" rx="12" fill="{VL}"/>',
  "4-form-fixes": f'<circle r="160" fill="{VL}"/><path d="M-78,4 L-20,62 L84,-58" fill="none" stroke="{INK}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>',
  "5-science": f'<path d="M-45,-160 H45 M-30,-160 V-50 L-130,120 Q-145,155 -105,155 H105 Q145,155 130,120 L30,-50 V-160" {st}/><path d="M-82,60 H82 L118,124 Q126,140 108,140 H-108 Q-126,140 -118,124 Z" fill="{VL}"/><circle cx="-20" cy="95" r="12" fill="{INK}"/><circle cx="30" cy="110" r="9" fill="{INK}"/>',
  "6-faq": f'<path d="M-150,-110 Q-150,-150 -110,-150 H110 Q150,-150 150,-110 V60 Q150,100 110,100 H-20 L-90,160 V100 H-110 Q-150,100 -150,60 Z" fill="{VL}"/><text x="0" y="45" text-anchor="middle" font-family="Cond" font-weight="800" font-size="200" fill="{INK}">?</text>',
  "7-giveaway": f'<rect x="-150" y="-40" width="300" height="190" rx="18" fill="{VL}"/><rect x="-170" y="-100" width="340" height="70" rx="16" fill="{P}"/><rect x="-22" y="-100" width="44" height="250" fill="{INK}" opacity=".85"/><path d="M0,-100 C-60,-190 -150,-150 -100,-110 Q-60,-95 0,-100 M0,-100 C60,-190 150,-150 100,-110 Q60,-95 0,-100" {st}/>',
}
for name, svg in ICONS.items():
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Cond;src:url(barlow-condensed-latin-800-normal.woff2)}}
body{{margin:0;width:1080px;height:1920px;background:{INK};position:relative;overflow:hidden}}
.g{{position:absolute;inset:0;background:radial-gradient(circle at 50% 50%,rgba(91,78,229,.55),transparent 55%)}}
.r{{position:absolute;inset:0;background-image:linear-gradient(rgba(139,128,255,.09) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(139,128,255,.09) 1.5px,transparent 1.5px);background-size:60px 60px}}
</style></head><body><div class="g"></div><div class="r"></div>
<svg width="1080" height="1920" style="position:absolute;inset:0"><g transform="translate(540 960) scale(1.55)">
<circle r="285" fill="rgba(91,78,229,.28)" stroke="rgba(139,128,255,.55)" stroke-width="4"/>{svg}</g></svg></body></html>'''
    open(f"{O}/{name}.html", "w").write(html)
print(len(ICONS))
