"use client";

import { Player } from "@remotion/player";
import { useEffect, useState } from "react";
import OrderSeal, { SEAL } from "@/remotion/OrderSeal";

/**
 * Plays the order seal once on the receipt. The box is sized before the
 * Player mounts, so nothing below it moves when it arrives; under reduced
 * motion it shows the finished seal without playing.
 */
export default function OrderSealPlayer() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setMounted(true);
  }, []);

  return (
    <div aria-hidden className="h-28 w-28 sm:h-32 sm:w-32">
      {mounted && (
        <Player
          component={OrderSeal}
          durationInFrames={SEAL.durationInFrames}
          fps={SEAL.fps}
          compositionWidth={SEAL.size}
          compositionHeight={SEAL.size}
          style={{ width: "100%", height: "100%" }}
          autoPlay={!reduced}
          initialFrame={reduced ? SEAL.durationInFrames - 1 : 0}
          controls={false}
          clickToPlay={false}
          doubleClickToFullscreen={false}
          spaceKeyToPlayOrPause={false}
          acknowledgeRemotionLicense
                  numberOfSharedAudioTags={0}
        />
      )}
    </div>
  );
}
