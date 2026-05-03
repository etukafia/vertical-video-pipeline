import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { normalise } from "../utils/britishEnglish";

export const HookText: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    fps,
    frame,
    config: { damping: 12 },
    from: 0.8,
    to: 1,
  });

  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <h1
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 900,
        fontSize: "140px",
        textAlign: "center",
        color: "white",
        textShadow: "0px 10px 30px rgba(0,0,0,0.8)",
        margin: "150px 80px",
        transform: `scale(${scale})`,
        opacity,
        lineHeight: 1.2,
      }}
    >
      {normalise(text)}
    </h1>
  );
};
