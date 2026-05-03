import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { normalise } from "../utils/britishEnglish";

export const LowerThird: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enters with a spring slide-in from the left
  const slideIn = spring({
    fps,
    frame,
    config: { damping: 14 },
    from: -2000,
    to: 100, // settle at 100px from left
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: "200px",
        left: `${slideIn}px`,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: "40px 60px",
        borderRadius: "20px",
        boxShadow: "0px 10px 30px rgba(0,0,0,0.5)",
        borderLeft: "20px solid #FF0066", // Brand accent color
      }}
    >
      <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 800, fontSize: "80px", color: "white", margin: 0 }}>
        {normalise(title)}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "50px", color: "#ddd", margin: "20px 0 0 0" }}>
          {normalise(subtitle)}
        </p>
      )}
    </div>
  );
};
