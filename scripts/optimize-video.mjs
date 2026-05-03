import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";

// Ensure ffmpeg binaries are available to fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);

const PROJECT_ROOT = path.resolve(process.cwd());
const INPUT_FILE = path.join(PROJECT_ROOT, "out", "raw.mp4");
const OUTPUT_FILE = path.join(PROJECT_ROOT, "out", "optimized_video.mp4");

async function main() {
  console.log("Starting FFmpeg Social Optimizer...");
  console.log(`Input: ${INPUT_FILE}`);
  console.log(`Output: ${OUTPUT_FILE}`);

  try {
    await new Promise((resolve, reject) => {
      ffmpeg(INPUT_FILE)
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-pix_fmt yuv420p',
          '-profile:v main',
          '-movflags +faststart'
        ])
        .save(OUTPUT_FILE)
        .on('start', (commandLine) => {
          console.log('Spawned FFmpeg with command: ' + commandLine);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${Math.floor(progress.percent || 0)}% done`);
        })
        .on('end', () => {
          console.log("Optimization complete.");
          resolve();
        })
        .on('error', (err) => {
          console.error("Error during optimization:", err.message);
          reject(err);
        });
    });

  } catch (error) {
    console.error("FFmpeg optimization failed.");
    process.exit(1);
  }
}

main();
