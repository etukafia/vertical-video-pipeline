export function computeCaptionTiming(captions: string[], durationInFrames: number) {
  if (!captions.length) return [];

  const gapFrames = 10;
  // Account for gapFrames between each caption
  const totalGapFrames = (captions.length - 1) * gapFrames;
  const availableFrames = durationInFrames - totalGapFrames;
  
  const baseFramesPerCaption = Math.floor(availableFrames / captions.length);

  let currentStartFrame = 0;
  const timings = captions.map((text, index) => {
    const isLast = index === captions.length - 1;
    // The last caption takes up the remaining frames to avoid rounding issues
    const endFrame = isLast 
      ? durationInFrames - 1 
      : currentStartFrame + baseFramesPerCaption;

    const timing = {
      text,
      startFrame: currentStartFrame,
      endFrame,
    };

    currentStartFrame = endFrame + gapFrames;
    return timing;
  });

  return timings;
}
