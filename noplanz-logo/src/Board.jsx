// Brand board: the wordmark on dark and light, the chat-bubble symbol, and the app icons, for review and export.
import { AbsoluteFill } from "remotion";
import { C, Symbol, Wordmark, AppIcon } from "./Logo.jsx";

export const Board = () => (
  <AbsoluteFill style={{ background: "#E9E4DC", padding: 60, display: "grid", gridTemplateColumns: "1.35fr 1fr", gridTemplateRows: "1fr 1fr", gap: 40 }}>
    <div style={{ borderRadius: 40, background: C.night, display: "grid", placeItems: "center" }}><Wordmark height={135} /></div>
    <div style={{ borderRadius: 40, background: C.night, display: "grid", placeItems: "center" }}><Symbol size={330} /></div>
    <div style={{ borderRadius: 40, background: C.paper, display: "grid", placeItems: "center" }}><Wordmark height={135} fill={C.night} dotA={C.coral} dotB={C.violet} dotM={C.lime} ring={C.paper} /></div>
    <div style={{ borderRadius: 40, background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", gap: 30 }}>
      <AppIcon size={170} />
      <AppIcon size={170} bg={C.coral} bubble={C.paper} line={C.night} dotA={C.coral} dotB={C.violet} dotM={C.lime} />
      <AppIcon size={170} bg={C.lime} bubble={C.night} line={C.paper} dotA={C.coral} dotB={C.lime} dotM={C.violet} />
    </div>
  </AbsoluteFill>
);
