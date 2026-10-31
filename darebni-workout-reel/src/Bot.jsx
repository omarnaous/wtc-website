// "Rep", a Darebni AI coach mascot: a friendly purple gym robot with a visor face, a cream sweatband and the
// Darebni waveform on the chest. A tiny 2D rig: torso + head placed from the hips and a torso direction, arms and
// legs solved with 2-bone IK towards hand/foot targets (or set directly with FK angles), so any exercise is just a
// set of targets per frame. Angles use dir(a) = (sin a, cos a): 0 = down, 90 = right, 180 = up, -90 = left.
export const B = { primary: "#5B4EE5", lo: "#8B80FF", xlo: "#B8B0FF", deep: "#4338CA", ink: "#07071A", surface: "#11112B", cream: "#F2F0EA", success: "#6EE7B7", danger: "#FB7185", steel: "#2A2A48", plate: "#1C1C33" };
export const dir = (a) => [Math.sin((a * Math.PI) / 180), Math.cos((a * Math.PI) / 180)];
export const add = (p, v, k = 1) => [p[0] + v[0] * k, p[1] + v[1] * k];
const angOf = (v) => (Math.atan2(v[0], v[1]) * 180) / Math.PI;
export const SIZE = { torso: 118, wFront: 104, wSide: 76, upper: 70, fore: 66, thigh: 72, shin: 70, limb: 28 };

// 2-bone IK: elbow/knee position for a limb from `a` towards target `t`; `bend` (+1/-1) picks the side
export function ik(a, t, l1, l2, bend) {
  const v = [t[0] - a[0], t[1] - a[1]];
  const d = Math.min(l1 + l2 - 0.5, Math.max(Math.abs(l1 - l2) + 1, Math.hypot(v[0], v[1])));
  const th = (Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))) * 180) / Math.PI;
  const mid = add(a, dir(angOf(v) + bend * th), l1);
  const end = add(mid, dir(angOf([t[0] - mid[0], t[1] - mid[1]])), l2);
  return [mid, end];
}
const fk = (a, a1, a2, l1, l2) => { const m = add(a, dir(a1), l1); return [m, add(m, dir(a2), l2)]; };

function Limb({ a, m, e, color, w = SIZE.limb, hand, foot, footAng = 90 }) {
  return (
    <g>
      <path d={`M${a[0]} ${a[1]} L${m[0]} ${m[1]} L${e[0]} ${e[1]}`} fill="none" stroke={B.ink} strokeWidth={w + 8} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${a[0]} ${a[1]} L${m[0]} ${m[1]} L${e[0]} ${e[1]}`} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={m[0]} cy={m[1]} r={w * 0.42} fill={B.deep} />
      {hand && <circle cx={e[0]} cy={e[1]} r={19} fill={B.cream} stroke={B.ink} strokeWidth="5" />}
      {foot && <ellipse cx={e[0] + Math.sin((footAng * Math.PI) / 180) * 14} cy={e[1] + 6} rx="30" ry="15" fill={B.cream} stroke={B.ink} strokeWidth="5" />}
    </g>
  );
}

// the head: rounded robot head, sweatband, dark visor with two pill eyes; `talk` 0..1 shows the waveform mouth
function Head({ c, ang, look = 0, blink = 0, effort = 0, talk = 0, t = 0 }) {
  const rot = 180 - ang;
  const eyeH = Math.max(3, 22 * (1 - blink) * (1 - effort * 0.75));
  const bars = [0.5, 0.9, 0.6, 1, 0.7];
  return (
    <g transform={`translate(${c[0]} ${c[1]}) rotate(${rot})`}>
      <rect x="-56" y="-50" width="112" height="100" rx="34" fill={B.primary} stroke={B.ink} strokeWidth="7" />
      <rect x="-56" y="-44" width="112" height="20" fill={B.cream} stroke={B.ink} strokeWidth="5" />
      <rect x="-56" y="-38" width="112" height="6" fill={B.primary} />
      <rect x="-42" y="-14" width="84" height="48" rx="20" fill={B.ink} />
      {effort > 0.5 ? (
        <g stroke={B.xlo} strokeWidth="6" strokeLinecap="round" fill="none"><path d={`M${-22 + look} 4 l10 6 l-10 6`} /><path d={`M${22 + look} 4 l-10 6 l10 6`} /></g>
      ) : (
        <g fill={B.xlo}><rect x={-26 + look} y={10 - eyeH / 2} width="13" height={eyeH} rx="6" /><rect x={13 + look} y={10 - eyeH / 2} width="13" height={eyeH} rx="6" /></g>
      )}
      {talk > 0.01 && <g fill={B.success}>{bars.map((b, i) => { const h = 4 + 12 * talk * b * (0.6 + 0.4 * Math.sin(t / 2 + i * 1.7)); return <rect key={i} x={-17 + i * 7.5} y={27 - h / 2} width="4.5" height={h} rx="2" />; })}</g>}
      <circle cx="-56" cy="6" r="9" fill={B.deep} stroke={B.ink} strokeWidth="5" /><circle cx="56" cy="6" r="9" fill={B.deep} stroke={B.ink} strokeWidth="5" />
      <line x1="0" y1="-50" x2="0" y2="-66" stroke={B.ink} strokeWidth="6" /><circle cx="0" cy="-70" r="8" fill={B.success} stroke={B.ink} strokeWidth="4" />
    </g>
  );
}

// the whole robot. view "front" | "side"; hips [x,y]; tdir torso direction (180 = upright);
// arms: [{ t:[x,y], bend } | { fk:[a1,a2] }] (near first in side view); legs: [{ t, bend }] likewise
export function Bot({ view = "front", hips, tdir = 180, arms, legs, face = {}, hold, t = 0 }) {
  const S = SIZE, side = view === "side";
  const up = dir(tdir), right = dir(tdir - 90);
  const neck = add(hips, up, S.torso);
  const head = add(neck, up, 58);
  const sh = side ? [add(add(neck, up, -14), right, 0)] : [add(add(neck, up, -16), right, S.wFront / 2 - 6), add(add(neck, up, -16), right, -(S.wFront / 2 - 6))];
  const hp = side ? [hips] : [add(hips, right, 26), add(hips, right, -26)];
  const solveArm = (i) => { const s = sh[side ? 0 : i], A = arms[i]; return [s, ...(A.fk ? fk(s, A.fk[0], A.fk[1], S.upper, S.fore) : ik(s, A.t, S.upper, S.fore, A.bend))]; };
  const solveLeg = (i) => { const s = hp[side ? 0 : i], L = legs[i]; return [s, ...(L.fk ? fk(s, L.fk[0], L.fk[1], S.thigh, S.shin) : ik(s, L.t, S.thigh, S.shin, L.bend))]; };
  const A = arms.map((_, i) => solveArm(i)), Lg = legs.map((_, i) => solveLeg(i));
  const w = side ? S.wSide : S.wFront, rot = 180 - tdir;
  const mid = add(hips, up, S.torso / 2);
  const torso = (
    <g transform={`translate(${mid[0]} ${mid[1]}) rotate(${rot})`}>
      <rect x={-w / 2} y={-S.torso / 2 - 8} width={w} height={S.torso + 22} rx={w * 0.34} fill={B.primary} stroke={B.ink} strokeWidth="7" />
      {!side && <g>{[10, 18, 8, 22, 12].map((h, i) => <rect key={i} x={-21 + i * 9} y={-14 - h / 2} width="6" height={h} rx="3" fill={i % 2 ? B.cream : B.xlo} />)}</g>}
      {side && <rect x={-w / 2 + 10} y={-S.torso / 2 + 6} width={14} height={S.torso - 16} rx="7" fill={B.lo} opacity=".6" />}
      <rect x={-w / 2} y={S.torso / 2 - 4} width={w} height="14" fill={B.deep} />
    </g>
  );
  const farArm = side && A[1], farLeg = side && Lg[1];
  return (
    <g>
      {farLeg && <g opacity=".75"><Limb a={farLeg[0]} m={farLeg[1]} e={farLeg[2]} color={B.deep} foot footAng={legs[1].footAng ?? 90} /></g>}
      {farArm && <g opacity=".75"><Limb a={farArm[0]} m={farArm[1]} e={farArm[2]} color={B.deep} hand /></g>}
      {hold && hold.behind && hold.behind(A)}
      {(side ? [Lg[0]] : Lg).map((l, i) => <Limb key={`l${i}`} a={l[0]} m={l[1]} e={l[2]} color={B.lo} foot footAng={(legs[i] && legs[i].footAng) ?? 90} />)}
      {torso}
      <Head c={head} ang={tdir} {...face} t={t} />
      {(side ? [A[0]] : A).map((a, i) => <Limb key={`a${i}`} a={a[0]} m={a[1]} e={a[2]} color={B.lo} hand />)}
      {hold && hold.front && hold.front(A)}
    </g>
  );
}
