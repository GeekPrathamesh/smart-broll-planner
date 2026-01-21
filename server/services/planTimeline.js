import { embed } from "./embed.js";
import { cosineSimilarity } from "./cosine.js";

const MIN_SEGMENT = 2.50;
const MAX_BROLL = 4.0;
const MIN_GAP = 0.2;

export async function planTimeline(translatedSegments, bRollsFromFrontend) {
  const brolls = await Promise.all(
    bRollsFromFrontend.map(async (b) => ({
      ...b,
      embedding: await embed(b.metadata),
    }))
  );

  const insertions = [];
  const usedBrollIds = new Set();
  let lastEndTime = -Infinity;

  for (const seg of translatedSegments) {
    const segDuration = seg.end_sec - seg.start_sec;

    // Rule 1: Segment must be long enough
    if (segDuration < MIN_SEGMENT) continue;

    const rawStart = seg.start_sec;
    const startTime = (rawStart < 1 ? 1 : rawStart) + 0.12;

    const maxPossible = seg.end_sec - startTime;
    if (maxPossible < MIN_SEGMENT) continue;

    const duration = Math.min(MAX_BROLL, maxPossible);
    const endTime = startTime + duration;

    // No overlap
    if (startTime < lastEndTime + MIN_GAP) continue;

    const segEmbed = await embed(seg.translated_text);

    let best = null;
    let bestScore = 0;

    for (const b of brolls) {
      if (usedBrollIds.has(b.id)) continue;

      const score = cosineSimilarity(segEmbed, b.embedding);
      console.log(score);
      

      if (score > bestScore) {
        bestScore = score;
        best = b;
      }
    }

    // Rule 3: Semantic confidence threshold
    if (!best || bestScore < 0.25) continue;

    insertions.push({
      start_sec: Number(startTime.toFixed(2)),
      end_sec: Number(endTime.toFixed(2)),
      duration_sec: Number(duration.toFixed(2)),
      broll_id: best.id,
      broll_URL: best.url,
      confidence: Number(bestScore.toFixed(2)),
      reason: `Matched visual context: ${best.metadata}`,
    });

    usedBrollIds.add(best.id);
    lastEndTime = endTime;
  }

  return { insertions };
}
