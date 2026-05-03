import { Composition } from "remotion";
import { VerticalVideo } from "./compositions/VerticalVideo";
import { EnrichedCampaignSchema } from "./schema";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VerticalVideo"
        component={VerticalVideo}
        durationInFrames={1800} // This is overridden by CLI --props
        fps={30}
        width={2160} // 4K Base
        height={3840} // 4K Base
        schema={EnrichedCampaignSchema}
        defaultProps={{
          campaignName: "Default Campaign",
          audioConfig: {
            accent: "Nigerian English",
            audioProfile: "Default Profile",
            voiceId: "en-NG-Standard-A"
          },
          script: "Default Script",
          captions: ["Default Caption"],
          audioPath: "voiceover.mp3",
          durationInFrames: 1800,
          durationInSeconds: 60,
          captionsTiming: []
        }}
      />
    </>
  );
};
