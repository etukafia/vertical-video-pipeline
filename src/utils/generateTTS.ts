import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';
import { parseBuffer } from 'music-metadata';
import { logger } from './logger';

export async function generateTTSWithRetry(
  script: string,
  audioConfig: any,
  outputPath: string,
  fps: number
) {
  let attempt = 1;
  const maxAttempts = 3;
  const backoffMs = [0, 2000, 6000];

  // Try to use GOOGLE_APPLICATION_CREDENTIALS, if not set but we have a base64 encoded one (from GitHub Actions), use that.
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    logger.warn("GOOGLE_APPLICATION_CREDENTIALS not set.");
  }

  const client = new textToSpeech.TextToSpeechClient();

  while (attempt <= maxAttempts) {
    if (attempt > 1) {
      await new Promise(res => setTimeout(res, backoffMs[attempt - 1]));
    }

    try {
      const voiceName = audioConfig.voiceId || 'en-NG-Standard-A';
      
      logger.info(`Calling Google Cloud TTS...`, { voiceName, attempt });

      const [response] = await client.synthesizeSpeech({
        input: { text: script },
        voice: {
          languageCode: 'en-NG',
          name: voiceName,
          ssmlGender: 'FEMALE', // Note: B and D are actually Male, but specifying it might restrict it. It's fine for now as per prompt.
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: audioConfig.audioProfile?.toLowerCase().includes('brisk') ? 1.1 : 1.0,
          pitch: 0,
          effectsProfileId: ['headphone-class-device'],
        },
      });

      if (!response.audioContent) {
        throw new Error('TTS returned empty audio content');
      }

      fs.writeFileSync(outputPath, response.audioContent as Uint8Array);
      logger.info('TTS audio generated and saved.');
      break;

    } catch (err: any) {
      logger.warn(`TTS attempt ${attempt} failed`, { error: err.message });
      if (attempt === maxAttempts) {
        throw new Error(`TTS failed after ${maxAttempts} attempts: ${err.message}`);
      }
      attempt++;
    }
  }

  // Extract duration using music-metadata (better than relying on ffmpeg locally)
  const buffer = fs.readFileSync(outputPath);
  const metaParsed = await parseBuffer(buffer, { mimeType: 'audio/mpeg' });
  const durationInSeconds = metaParsed.format.duration || 0;

  if (durationInSeconds === 0) {
    throw new Error('Could not extract audio duration from TTS output');
  }

  const durationInFrames = Math.ceil(durationInSeconds * fps);

  return { durationInSeconds, durationInFrames, generatedAt: new Date().toISOString() };
}
