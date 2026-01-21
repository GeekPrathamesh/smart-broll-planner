function parseTime(t) {
  if (!t) return 0;
  if (typeof t === "string") return parseFloat(t.replace("s", ""));
  return (t.seconds || 0) + (t.nanos || 0) / 1e9;
}

export function buildSegments(words, transcript) {
  const sentences = transcript
    .replace(/([.?!।])/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(Boolean);

  let index = 0;
  const segments = [];

  sentences.forEach(sentence => {
    const wordCount = sentence.split(/\s+/).length;

    const start = parseTime(words[index].startTime);
    const end = parseTime(words[index + wordCount - 1].endTime);

    segments.push({
      text: sentence,
      start,
      end
    });

    index += wordCount;
  });

  return segments;
}
