export const PROFILES = {
  preview:    { width: 720,  height: 1280, fps: 30, concurrency: 2 },
  fast:       { width: 1080, height: 1920, fps: 30, concurrency: 4 },
  production: { width: 2160, height: 3840, fps: 30, concurrency: 6 },
} as const;

export type ProfileKey = keyof typeof PROFILES;

export function getProfile(key: string): typeof PROFILES[ProfileKey] {
  if (!Object.keys(PROFILES).includes(key)) {
    throw new Error(`Invalid RENDER_PROFILE: "${key}". Must be preview | fast | production`);
  }
  return PROFILES[key as ProfileKey];
}
