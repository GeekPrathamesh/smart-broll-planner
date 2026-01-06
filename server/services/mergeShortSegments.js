export function mergeShortSegments(segments, minDuration = 1.8) {
  const merged = [];

  for (const seg of segments) {
    const duration = seg.end_sec - seg.start_sec;

    if (merged.length === 0 || duration >= minDuration) {
      merged.push(seg);
    } else {
      const prev = merged[merged.length - 1];
      prev.text += " " + seg.text;
      prev.end_sec = seg.end_sec;
    }
  }

  return merged;
}
