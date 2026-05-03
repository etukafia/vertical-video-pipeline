import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { normalise } from "../utils/britishEnglish";
import { EnrichedCampaign } from "../schema";

export const CaptionText: React.FC<{ timings: EnrichedCampaign['captionsTiming'] }> = ({ timings }) => {
  const frame = useCurrentFrame();

  const activeCaption = timings.find(
    (t) => frame >= t.startFrame && frame <= t.endFrame
  );

  if (!activeCaption) return null;

  // Simple slide-up and fade-in for each caption based on its startFrame
  const relativeFrame = frame - activeCaption.startFrame;
  const opacity = interpolate(relativeFrame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const translateY = interpolate(relativeFrame, [0, 10], [50, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        top: "50%",
        transform: `translateY(-50%) translateY(${translateY}px)`,
        opacity,
      }}
    >
      <h2
        style={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: "100px",
          textAlign: "center",
          color: "#FFE81F", // Bright attention color
          WebkitTextStroke: "4px black",
          textShadow: "0px 10px 20px rgba(0,0,0,0.8)",
          maxWidth: "80%",
          lineHeight: 1.3,
        }}
      >
        {normalise(activeCaption.text)}
      </h2>
    </div>
  );
};
