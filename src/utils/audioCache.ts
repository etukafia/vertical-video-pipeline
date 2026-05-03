import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { logger } from "./logger";

const CACHE_DIR = path.join(process.cwd(), "audio-cache");

export async function initCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (err) {
    // ignore if exists
  }
}

export function generateCacheKey(script: string, audioConfig: any): string {
  const payload = script + JSON.stringify(audioConfig);
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export async function lookupCache(cacheKey: string) {
  const audioPath = path.join(CACHE_DIR, `${cacheKey}.mp3`);
  const metaPath = path.join(CACHE_DIR, `${cacheKey}.json`);

  try {
    const audioStat = await fs.stat(audioPath);
    if (audioStat.size > 0) {
      const metaContent = await fs.readFile(metaPath, "utf-8");
      const metadata = JSON.parse(metaContent);
      logger.info("Audio cache hit", { cacheKey });
      return { audioPath, metadata, isHit: true };
    }
  } catch (err) {
    // Cache miss
  }

  logger.debug("Audio cache miss", { cacheKey });
  return { audioPath, metaPath, isHit: false };
}
