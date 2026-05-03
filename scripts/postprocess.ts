import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import { logger } from "../src/utils/logger";

ffmpeg.setFfmpegPath(ffmpegStatic);

const PROJECT_ROOT = path.resolve(process.cwd());
const ENRICHED_DATA_FILE = path.join(PROJECT_ROOT, "data", "enriched.json");
const RENDERS_DIR = path.join(PROJECT_ROOT, "renders");
const FINAL_DIR = path.join(PROJECT_ROOT, "final");

async function main() {
  logger.info("Starting post-processing pipeline");

  if (!fs.existsSync(ENRICHED_DATA_FILE)) {
    logger.error("Enriched data file missing.");
    process.exit(1);
  }

  const enrichedData = JSON.parse(fs.readFileSync(ENRICHED_DATA_FILE, "utf-8"));
  const campaignName = enrichedData.campaignName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  
  const rawInputPath = path.join(RENDERS_DIR, `${campaignName}-raw.mp4`);

  if (!fs.existsSync(rawInputPath)) {
    logger.error("Raw render file missing", { rawInputPath });
    process.exit(1);
  }

  if (!fs.existsSync(FINAL_DIR)) {
    fs.mkdirSync(FINAL_DIR, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "");
  const outputPath = path.join(FINAL_DIR, `${campaignName}-${timestamp}.mp4`);

  logger.info("Running FFmpeg post-processing", { input: rawInputPath, output: outputPath });

  try {
    await new Promise<void>((resolve, reject) => {
      ffmpeg(rawInputPath)
        .outputOptions([
          '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2',
          '-c:v libx264',
          '-profile:v high',
          '-crf 23',
          '-preset fast',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
          '-c:a aac',
          '-b:a 192k',
          '-ar 44100',
          '-ac 2',
          '-maxrate 6M',
          '-bufsize 12M'
        ])
        .save(outputPath)
        .on('progress', (progress) => {
          // Log sparingly to avoid flooding
          if (Math.floor(progress.percent || 0) % 25 === 0) {
            logger.debug(`FFmpeg progress: ${Math.floor(progress.percent || 0)}%`);
          }
        })
        .on('end', () => {
          logger.info("FFmpeg processing complete");
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          logger.error("FFmpeg Error", { err: err.message, stderr });
          reject(err);
        });
    });

    const stat = fs.statSync(outputPath);
    if (stat.size > 0) {
      logger.info("Output verified. Deleting raw render.", { sizeBytes: stat.size });
      fs.unlinkSync(rawInputPath);
      logger.info(`Pipeline completely successful. Final video at: ${outputPath}`);
    } else {
      throw new Error("Output file is empty.");
    }

  } catch (error: any) {
    logger.error("Post-processing failed", { error: error.message });
    process.exit(1);
  }
}

main();
