import { z } from "zod";

export const AudioConfigSchema = z.object({
  accent: z.string().default('Nigerian English'),
  audioProfile: z.string().optional(),
  voiceId: z.string().default('en-NG-Standard-A'),
});

export const CampaignSchema = z.object({
  campaignName: z.string().min(1),
  audioConfig: AudioConfigSchema,
  script: z.string().min(1),
  captions: z.array(z.string()).min(1),
});

export const EnrichedCampaignSchema = CampaignSchema.extend({
  audioPath: z.string(),
  durationInFrames: z.number().int().positive(),
  durationInSeconds: z.number().positive(),
  captionsTiming: z.array(z.object({
    text: z.string(),
    startFrame: z.number().int(),
    endFrame: z.number().int(),
  })),
});

export type Campaign = z.infer<typeof CampaignSchema>;
export type EnrichedCampaign = z.infer<typeof EnrichedCampaignSchema>;
