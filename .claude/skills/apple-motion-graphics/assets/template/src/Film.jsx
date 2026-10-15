// Mac notch launch film starter (references/launch-film.md). The notch grows into a widget per scene, each scene has
// its own wallpaper and one caption, it opens on "hello" and closes to the resting notch with the product line.
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Audio, staticFile } from "remotion";
import { useFonts, fonts, aspring, clamp, type, Caption, Wallpaper, MenuBar, Notch, Glass, Lines, Hello, HELLO_D } from "./apple.jsx";
import { SCENE, FILM_SCENES, at, REST, NOTCH } from "./timing.js";

// Notch keys worked out from the start of the film: each scene springs from wherever the notch is now.
const wKeys = [[0, REST[0]], ...NOTCH.map(([w], i) => [at(i) + (i ? 0 : 4), w])];
const hKeys = [[0, REST[1]], ...NOTCH.map(([, h], i) => [at(i) + (i ? 2 : 6), h])];

// 0..1 visibility of scene i's content: in after the notch opens, out just before the next scene starts.
const inScene = (f, i, inAt = 10, outBy = 6) =>
  Math.min(aspring(f, at(i) + inAt, 1, 0.35), 1 - interpolate(f, [at(i + 1) - outBy, at(i + 1)], [0, 1], clamp));

export function Film({ product, line, menu, scenes }) {
  useFonts(fonts);
  const f = useCurrentFrame(), { width, height } = useVideoConfig(), u = width / 1920, last = FILM_SCENES - 1;
  const capTop = height * (height > width ? 0.42 : 0.56);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {scenes.map((s, k) => {
        const i = k + 1, o = interpolate(f, [at(i) - 8, at(i) + 4, at(i + 1) - 4, at(i + 1) + 8], [0, 1, 1, 0], clamp);
        return <Wallpaper key={k} {...s.wall} opacity={o} drift={(f - at(i)) / SCENE} />;
      })}
      <MenuBar items={menu} glyph={false} opacity={interpolate(f, [at(1) - 8, at(1) + 4, at(last) - 4, at(last) + 8], [0, 1, 1, 0], clamp)} />
      <Notch f={f} wKeys={wKeys} hKeys={hKeys}>
        {scenes.map((s, k) => {
          const i = k + 1, v = inScene(f, i);
          return v > 0.001 && (
            <div key={k} style={{ position: "absolute", inset: 0, padding: `${48 * u}px ${36 * u}px ${28 * u}px`, display: "flex", gap: 20 * u, opacity: v }}>
              <div style={{ width: 120 * u, height: 120 * u, borderRadius: 30 * u, background: s.wall.a, flex: "none" }} />
              <div style={{ flex: 1, paddingTop: 10 * u }}><Lines n={3} h={10 * u} gap={12 * u} /></div>
            </div>
          );
        })}
      </Notch>
      {/* scene 0: hello, centred, drawn on */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - interpolate(f, [at(1) - 10, at(1)], [0, 1], clamp) }}>
        <Hello f={f} at={10} d={HELLO_D} width={Math.min(520 * u * (height > width ? 1.7 : 1), width * 0.7)} stroke={9} />
      </AbsoluteFill>
      {scenes.map((s, k) => {
        const i = k + 1, out = 1 - interpolate(f, [at(i + 1) - 8, at(i + 1)], [0, 1], clamp);
        return f >= at(i) && f < at(i + 1) && (
          <div key={k} style={{ opacity: out }}><Caption f={f} at={at(i) + 14} text={s.caption} tint={s.tint} size={(height > width ? 76 : 64) * u * (height > width ? 1.6 : 1)} top={capTop} /></div>
        );
      })}
      {/* close: the notch rests, the product line lands under it */}
      {f >= at(last) && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 * u }}>
          <div style={{ ...type(96 * u * (height > width ? 1.5 : 1)), color: "#fff", opacity: aspring(f, at(last) + 12, 1, 0.5) }}>{product}</div>
          <div style={{ ...type(36 * u * (height > width ? 1.5 : 1)), color: "rgba(255,255,255,.62)", opacity: aspring(f, at(last) + 22, 1, 0.5) }}>{line}</div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile("film.wav")} />
    </AbsoluteFill>
  );
}
