import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig, interpolate, useCurrentFrame } from "remotion";
import { BoldHook, LowerThird, Caption } from "./components/Typography";
import { VideoProps } from "./Root";

export const MainVideo: React.FC<VideoProps> = ({ campaignName, script, captions, audioConfig }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Simple staggered animation for background
  const bgOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  // Calculate rough duration per caption
  const framesPerCaption = Math.floor(durationInFrames / Math.max(1, captions.length));

  return (
    <AbsoluteFill style={{ backgroundColor: "#111", opacity: bgOpacity }}>
      {/* 
        Ensure there is a voiceover.mp3 in public/ folder. 
        The script fetch-audio.mjs will put it there.
      */}
      <Audio src={staticFile("voiceover.mp3")} />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        {/* Dynamic Captions Sequence */}
        {captions.map((cap, index) => {
          const startFrame = index * framesPerCaption;
          return (
            <Sequence key={index} from={startFrame} durationInFrames={framesPerCaption}>
              <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
                <Caption text={cap} />
              </AbsoluteFill>
            </Sequence>
          );
        })}
      </AbsoluteFill>

      {/* Persistent Lower Third for Campaign Name */}
      <Sequence from={15}>
        <LowerThird title={campaignName} subtitle="Special Offer" />
      </Sequence>
      
      {/* Initial Bold Hook */}
      <Sequence from={0} durationInFrames={45}>
        <AbsoluteFill style={{ justifyContent: "flex-start", paddingTop: "200px" }}>
          <BoldHook text={captions[0] || "Hook"} />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
