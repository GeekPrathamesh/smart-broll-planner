import fs from "fs";
import path from "path";

export function readWhisperOutput(audioPath) {
  const jsonPath = audioPath.replace(".wav", ".json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);

  return data.segments.map(seg => ({
    start: Number(seg.start.toFixed(2)),
    end: Number(seg.end.toFixed(2)),
    text: seg.text.trim(),
  }));
}
