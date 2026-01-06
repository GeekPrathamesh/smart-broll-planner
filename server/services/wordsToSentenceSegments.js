export function wordsToSentenceSegments(words) {
  const segments = [];
  let current = null;

  for (const w of words) {
    if (!current) {
      current = {
        text: w.text,
        start_sec: w.start,
        end_sec: w.end,
      };
    } else {
      current.text += " " + w.text;
      current.end_sec = w.end;
    }

    if (/[.!?]/.test(w.text)) {
      segments.push(current);
      current = null;
    }
  }

  if (current) segments.push(current);
  return segments;
}
