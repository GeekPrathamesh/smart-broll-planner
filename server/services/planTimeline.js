import { embed } from "./embed.js";
import { cosineSimilarity } from "./cosine.js";
import { BROLLS } from "../data/broll.js";

export async function planTimeline(segments) {
  // Embed B-rolls
  for (const b of BROLLS) {
    b.embedding = await embed(b.description);
  }

  const insertions = [];
  let lastInsertTime = -10;

  for (const seg of segments) {
    if (seg.start_sec - lastInsertTime < 4) continue;

    const segEmbed = await embed(seg.text);

    let best = null;
    let bestScore = 0;

    for (const b of BROLLS) {
      const score = cosineSimilarity(segEmbed, b.embedding);
      console.log(score);
      if (score > bestScore) {
        bestScore = score;
        best = b;
      }
    }

    if (best && bestScore > 0.22) {
      insertions.push({
        start_sec: seg.start_sec,
        duration_sec: Math.min(2.5, seg.end_sec - seg.start_sec),
        broll_id: best.id,
        confidence: Number(bestScore.toFixed(2)),
        reason: `Matched visual context: ${best.description}`,
      });

      lastInsertTime = seg.start_sec;
    }
  }

  return {
    insertions,
  };
}
