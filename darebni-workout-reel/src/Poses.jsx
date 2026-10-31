// Rep's two poses for the reel: a double-biceps flex (intro) and a wave (the CTA). Floor at y = 1258.
import { Bot } from "./Bot.jsx";

const FLOOR = 1258;

// intro: a double-biceps flex; outro: a wave
export function Flex({ t, k = 1 }) {
  const hips = [540, 1072], bob = Math.sin(t / 6) * 4;
  return (
    <Bot view="front" hips={[hips[0], hips[1] + bob]} t={t} face={{ talk: 0, look: 0, blink: t % 70 > 66 ? 1 : 0 }}
      arms={[{ fk: [90 - 6 * k, 168] }, { fk: [-90 + 6 * k, -168] }]} legs={[{ t: [598, FLOOR - 8], bend: 1 }, { t: [482, FLOOR - 8], bend: -1 }]} />
  );
}
export function Wave({ t }) {
  const hips = [540, 1072], w = Math.sin(t / 4) * 18;
  return (
    <Bot view="front" hips={hips} t={t} face={{ talk: 1, blink: t % 70 > 66 ? 1 : 0 }}
      arms={[{ fk: [140 + w * 0.3, 175 + w] }, { t: [470, 1010], bend: 1 }]} legs={[{ t: [590, FLOOR - 8], bend: 1 }, { t: [490, FLOOR - 8], bend: -1 }]} />
  );
}
