import React from "react";
import { AbsoluteFill, Audio, Sequence, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { EnrichedCampaign } from "../schema";
import { HookText } from "../components/HookText";
import { CaptionText } from "../components/CaptionText";
import { LowerThird } from "../components/LowerThird";

export const VerticalVideo: React.FC<EnrichedCampaign> = (props) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Subtle Ken Burns zoom on the background image
  // Zooms from 1.0 to 1.15 over the entire duration
  const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.15]);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Background Image with Ken Burns effect */}
      <AbsoluteFill style={{ transform: `scale(${bgScale})`, transformOrigin: "center center" }}>
        <Img 
          src={staticFile("locked_beauty_with_code.jpeg")} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </AbsoluteFill>

      {/* Dark gradient overlay to make text pop */}
      <AbsoluteFill 
        style={{ 
          background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.8) 100%)" 
        }} 
      />

      <Audio src={staticFile(props.audioPath)} />

      {/* Hook Sequence (first 3 seconds / 90 frames approx) */}
      <Sequence from={0} durationInFrames={90}>
        <HookText text={props.captions[0] || props.campaignName} />
      </Sequence>

      {/* Dynamic Captions starting after the hook */}
      <Sequence from={90}>
        <CaptionText timings={props.captionsTiming} />
      </Sequence>

      {/* Lower Third entering at 80% of video duration */}
      <Sequence from={Math.floor(durationInFrames * 0.8)}>
        <LowerThird title={props.campaignName} subtitle="Refer & Earn ₦500" />
      </Sequence>
    </AbsoluteFill>
  );
};
