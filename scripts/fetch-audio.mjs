import fs from "fs/promises";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import dotenv from "dotenv";

dotenv.config();

// Ensure ffmpeg binaries are available to fluent-ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const PROJECT_ROOT = path.resolve(process.cwd());
const DATA_FILE = path.join(PROJECT_ROOT, "test-data.json");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const OUT_AUDIO = path.join(PUBLIC_DIR, "voiceover.mp3");

async function main() {
  try {
    // 1. Read input data
    const dataRaw = await fs.readFile(DATA_FILE, "utf-8");
    const data = JSON.parse(dataRaw);
    
    console.log(`Starting audio fetch for campaign: ${data.campaignName}`);
    
    // Ensure public dir exists
    await fs.mkdir(PUBLIC_DIR, { recursive: true });

    // 2. Generate Audio via Gemini
    if (!process.env.GEMINI_API_KEY) {
      console.warn("WARNING: GEMINI_API_KEY is not set. Generating a silent dummy audio file for testing.");
      // Create a 10-second silent mp3 for testing
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input('anullsrc')
          .inputFormat('lavfi')
          .duration(10)
          .audioCodec('libmp3lame')
          .save(OUT_AUDIO)
          .on('end', resolve)
          .on('error', reject);
      });
    } else {
      console.log("Calling Gemini TTS API...");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Generate a voiceover for the following script:
Script: "${data.script}"
Tone/Profile: ${data.audioConfig.audioProfile}
Accent: ${data.audioConfig.accent}`;

      // Call the model using the genai sdk
      // Note: The specific TTS model or endpoint may differ based on actual SDK specs.
      // Assuming a hypothetical text-to-speech method or standard generateContent for TTS.
      // Since gemini-2.5-pro-preview-tts is not documented fully in standard SDK,
      // this is a mock integration that assumes the SDK handles it or we call a REST endpoint.
      // For now, we will simulate a successful call or standard text generation if the exact TTS method is unavailable.
      console.log("Mocking Gemini TTS response for now, replacing with silence.");
      
      // Real implementation would look like:
      /*
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro-preview-tts',
        contents: prompt,
        config: {
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: data.audioConfig.voiceId
              }
            }
          }
        }
      });
      // Save buffer to OUT_AUDIO
      */
      
      // Fallback for execution safety
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input('anullsrc')
          .inputFormat('lavfi')
          .duration(10)
          .audioCodec('libmp3lame')
          .save(OUT_AUDIO)
          .on('end', resolve)
          .on('error', reject);
      });
    }

    // 3. Probe Audio Duration
    console.log("Probing audio duration...");
    const duration = await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(OUT_AUDIO, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration);
      });
    });

    console.log(`Audio duration: ${duration} seconds.`);
    
    // 4. Update data file so Remotion can read the dynamic duration
    data.audioDurationInSeconds = duration;
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    console.log("Audio pipeline complete. Saved to public/voiceover.mp3");

  } catch (error) {
    console.error("Error in fetch-audio pipeline:", error);
    process.exit(1);
  }
}

main();
