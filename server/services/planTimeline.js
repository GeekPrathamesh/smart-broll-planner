import { embed } from "./embed.js";
import { cosineSimilarity } from "./cosine.js";
import { BROLLS } from "../data/broll.js";

export async function planTimeline(translatedSegments) {
  // Embed B-rolls once
  for (const b of BROLLS) {
    b.embedding = await embed(b.description);
  }

  const insertions = [];
  const usedBrollIds = new Set(); // 👈 NEW
  let lastInsertTime = -10;

  for (const seg of translatedSegments) {
    if (seg.start_sec - lastInsertTime < 3) continue;

    const segEmbed = await embed(seg.translated_text);

    let best = null;
    let bestScore = 0;

    for (const b of BROLLS) {
      if (usedBrollIds.has(b.id)) continue; // 👈 NEW

      const score = cosineSimilarity(segEmbed, b.embedding);
      console.log(score);

      if (score > bestScore) {
        bestScore = score;
        best = b;
      }
    }

    if (best && bestScore > 0.3) {
      // const startTime = seg.start_sec < 1.5 ? 1.5 : seg.start_sec;

const startTime = Math.max(1, seg.start_sec);

insertions.push({
  start_sec: startTime,
  duration_sec: Math.min(2.5, seg.end_sec - seg.start_sec),
  broll_id: best.id,
  confidence: Number(bestScore.toFixed(2)),
  reason: `Matched visual context: ${best.description}`,
});

usedBrollIds.add(best.id);
lastInsertTime = startTime;

    }
  }

  return { insertions };
}
