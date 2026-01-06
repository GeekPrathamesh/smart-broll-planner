import "dotenv/config";
import { transcribeARoll } from "./services/transcribe.js";
import { planTimeline } from "./services/planTimeline.js";
import { translateSegmentsBatch } from "./services/translatebatch.js";

const A_ROLL_URL = "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/a_roll.mp4";

(async () => {
  try {
    console.log("Transcribing A-roll...");
    const transcript = await transcribeARoll(A_ROLL_URL);
console.log("RAW TRANSCRIPT RESPONSE:");


    // Convert OpenAI segments into our internal format
    const sentenceSegments = transcript.segments.map(s => ({
      text: s.text,
      start_sec: s.start,
      end_sec: s.end,
    }));

    console.log(JSON.stringify(transcript.text, null, 2));
    console.log(sentenceSegments);
    

    console.log("Planning B-roll insertions...");
    const translatedSegments = await translateSegmentsBatch(sentenceSegments);
        console.log(translatedSegments);

    const timeline = await planTimeline(translatedSegments);

    console.log("\n✅ FINAL TIMELINE JSON:\n");
    console.log(JSON.stringify(timeline, null, 2));
  } catch (err) {
    console.error("❌ Error:", err);
  }
})();
