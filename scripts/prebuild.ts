import fs from "fs/promises";
import path from "path";
import { CampaignSchema, EnrichedCampaignSchema } from "../src/schema";
import { getProfile } from "../src/utils/renderProfiles";
import { generateCacheKey, lookupCache, initCacheDir } from "../src/utils/audioCache";
import { generateTTSWithRetry } from "../src/utils/generateTTS";
import { computeCaptionTiming } from "../src/utils/captionTiming";
import { logger } from "../src/utils/logger";

const PROJECT_ROOT = path.resolve(process.cwd());
const DATA_FILE = process.env.DATA_FILE || path.join(PROJECT_ROOT, "test-data.json");
const ENRICHED_DATA_FILE = path.join(PROJECT_ROOT, "data", "enriched.json");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");

async function main() {
  logger.info("Starting prebuild pipeline");

  try {
    // Ensure directories exist
    await initCacheDir();
    await fs.mkdir(path.dirname(ENRICHED_DATA_FILE), { recursive: true });
    await fs.mkdir(PUBLIC_DIR, { recursive: true });

    // 1. Load and Parse
    const rawData = await fs.readFile(DATA_FILE, "utf-8");
    const parsedJson = JSON.parse(rawData);

    // 2. Validate Campaign
    const campaign = CampaignSchema.parse(parsedJson);
    logger.info("Campaign validated successfully", { campaignName: campaign.campaignName });

    // 3. Load Profile
    const profileKey = process.env.RENDER_PROFILE || "fast";
    const profile = getProfile(profileKey);
    logger.info(`Using render profile: ${profileKey}`);

    // 4. Audio Caching & Generation
    const cacheKey = generateCacheKey(campaign.script, campaign.audioConfig);
    const cacheResult = await lookupCache(cacheKey);

    let audioMetadata;
    let audioFileName = `${cacheKey}.mp3`;
    let publicAudioPath = path.join(PUBLIC_DIR, audioFileName);

    if (cacheResult.isHit && cacheResult.metadata) {
      audioMetadata = cacheResult.metadata;
      // Copy cached audio to public/ so remotion can access it
      await fs.copyFile(cacheResult.audioPath, publicAudioPath);
    } else {
      // Generate TTS
      logger.info("Generating new TTS audio...");
      audioMetadata = await generateTTSWithRetry(
        campaign.script,
        campaign.audioConfig,
        cacheResult.audioPath,
        profile.fps
      );
      
      // Save metadata sidecar
      if (cacheResult.metaPath) {
        await fs.writeFile(cacheResult.metaPath, JSON.stringify(audioMetadata, null, 2));
      }
      
      // Copy to public
      await fs.copyFile(cacheResult.audioPath, publicAudioPath);
    }

    // 5. Compute Timing
    const timings = computeCaptionTiming(campaign.captions, audioMetadata.durationInFrames);

    // 6. Construct Enriched Campaign
    const enriched = {
      ...campaign,
      audioPath: audioFileName,
      durationInSeconds: audioMetadata.durationInSeconds,
      durationInFrames: audioMetadata.durationInFrames,
      captionsTiming: timings
    };

    // 7. Validate Enriched
    const validatedEnriched = EnrichedCampaignSchema.parse(enriched);

    // 8. Write Contract
    await fs.writeFile(ENRICHED_DATA_FILE, JSON.stringify(validatedEnriched, null, 2));
    logger.info("Prebuild completed successfully", { 
      durationInFrames: validatedEnriched.durationInFrames 
    });

  } catch (error: any) {
    logger.error("Prebuild failed", { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

main();
