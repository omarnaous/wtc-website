// Brand board: the logo on dark and light, the mark, and app icons, for review and export. `wave` picks the route.
import { AbsoluteFill } from "remotion";
import { C, WAVE, Mark, Wordmark, AppIcon } from "./Logo.jsx";

export const Board = ({ wave = WAVE }) => (
  <AbsoluteFill style={{ background: "#E9E4DC", padding: 60, display: "grid", gridTemplateColumns: "1.35fr 1fr", gridTemplateRows: "1fr 1fr", gap: 40 }}>
    <div style={{ borderRadius: 40, background: C.night, display: "grid", placeItems: "center" }}><Wordmark height={150} wave={wave} /></div>
    <div style={{ borderRadius: 40, background: C.coral, display: "grid", placeItems: "center" }}><Mark size={340} line={C.night} dotA={C.paper} dotB={C.lime} wave={wave} /></div>
    <div style={{ borderRadius: 40, background: C.paper, display: "grid", placeItems: "center" }}><Wordmark height={150} fill={C.night} dotA={C.coral} dotB={C.violet} wave={wave} /></div>
    <div style={{ borderRadius: 40, background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <AppIcon size={180} wave={wave} />
      <AppIcon size={180} bg={C.coral} line={C.night} dotA={C.paper} dotB={C.lime} wave={wave} />
      <AppIcon size={180} bg={C.lime} line={C.night} dotA={C.coral} dotB={C.violet} wave={wave} />
    </div>
  </AbsoluteFill>
);
