import { embed } from "./embed.js";
import { cosineSimilarity } from "./cosine.js";

export async function planTimeline(translatedSegments, bRollsFromFrontend) {
  /* Embed of frontend B-rolls by open ai key that mere pass hai */
  const brolls = await Promise.all(
    bRollsFromFrontend.map(async (b) => ({
      ...b,
      embedding: await embed(b.metadata),
    }))
  );

  const insertions = [];
  const usedBrollIds = new Set();
  let lastInsertTime = -10;

  for (const seg of translatedSegments) {
    if (seg.start_sec - lastInsertTime < 3) continue;

    const segEmbed = await embed(seg.translated_text);

    let best = null;
    let bestScore = 0;

    for (const b of brolls) {
      if (usedBrollIds.has(b.id)) continue;

      const score = cosineSimilarity(segEmbed, b.embedding);

      if (score > bestScore) {
        bestScore = score;
        best = b;
      }
    }

    if (best && bestScore > 0.3) {
      const startTime = Math.max(1, seg.start_sec);

      insertions.push({
        start_sec: startTime,
        duration_sec: Math.min(2.5, seg.end_sec - seg.start_sec),
        broll_id: best.id,
        confidence: Number(bestScore.toFixed(2)),
        reason: `Matched visual context: ${best.metadata}`,
        broll_URL:best.url,
      });

      usedBrollIds.add(best.id);
      lastInsertTime = startTime;
    }
  }

  return { insertions };
}
