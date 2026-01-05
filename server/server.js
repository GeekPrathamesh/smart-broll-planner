import "dotenv/config";
import { transcribeARoll } from "./services/transcribe.js";


const A_ROLL_URL =
  "https://fzuudapb1wvjxbrr.public.blob.vercel-storage.com/food_quality_ugc/a_roll.mp4";

(async () => {
  try {
    const transcript = await transcribeARoll(A_ROLL_URL);
    console.log(JSON.stringify(transcript, null, 2));
  } catch (err) {
    console.error("Transcription failed:", err);
  }
})();
