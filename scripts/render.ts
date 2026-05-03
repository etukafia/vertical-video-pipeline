import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { logger } from "../src/utils/logger";
import { getProfile } from "../src/utils/renderProfiles";

const PROJECT_ROOT = path.resolve(process.cwd());
const ENRICHED_DATA_FILE = path.join(PROJECT_ROOT, "data", "enriched.json");
const RENDERS_DIR = path.join(PROJECT_ROOT, "renders");

async function main() {
  logger.info("Starting render pipeline");

  if (!fs.existsSync(ENRICHED_DATA_FILE)) {
    logger.error("Enriched data file missing. Run prebuild first.", { path: ENRICHED_DATA_FILE });
    process.exit(1);
  }

  const enrichedData = JSON.parse(fs.readFileSync(ENRICHED_DATA_FILE, "utf-8"));
  const campaignName = enrichedData.campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const profileKey = process.env.RENDER_PROFILE || "fast";
  const profile = getProfile(profileKey);

  // Derive scale factor relative to 4K (2160 width)
  const scale = Number((profile.width / 2160).toFixed(4));
  const concurrency = process.env.RENDER_CONCURRENCY || profile.concurrency;

  if (!fs.existsSync(RENDERS_DIR)) {
    fs.mkdirSync(RENDERS_DIR, { recursive: true });
  }

  const rawOutputPath = path.join(RENDERS_DIR, `${campaignName}-raw.mp4`);

  const cmd = `npx remotion render src/index.ts VerticalVideo "${rawOutputPath}" --props="${ENRICHED_DATA_FILE}" --concurrency=${concurrency} --scale=${scale} --log=verbose`;

  logger.info(`Executing Remotion build`, { cmd, profileKey, scale });

  try {
    execSync(cmd, { stdio: "inherit", cwd: PROJECT_ROOT });
    logger.info("Render completed successfully", { output: rawOutputPath });
  } catch (error: any) {
    logger.error("Remotion render failed", { error: error.message });
    process.exit(1);
  }
}

main();
