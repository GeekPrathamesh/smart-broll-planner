import express from "express";
import "dotenv/config";
import cors from "cors";
import { transcribeARoll } from "./services/transcribe.js";
import { translateSegmentsBatch } from "./services/translatebatch.js";
import { planTimeline } from "./services/planTimeline.js";
import router from "./routes/generateVideorouter.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));


app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    openai_key_loaded: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/video",router);
app.use("/tmp", express.static("tmp"));


app.post("/api/generate", async (req, res) => {
  try {
    const { a_roll, b_rolls } = req.body;
    console.log("a_roll and b_roll are received");

    if (!a_roll?.url) {
      return res.status(400).json({ error: "A-roll URL missing" });
    }

    if (!Array.isArray(b_rolls) || b_rolls.length === 0) {
      return res.status(400).json({ error: "B-rolls missing" });
    }

    /* 1️⃣ Transcribe A-roll */
    const transcript = await transcribeARoll(a_roll.url);

    console.log("extracted mp3 from mp4 successfully & converted to transcript successfully..");

    const segments = transcript.segments.map((s) => ({
      text: s.text,
      start_sec: s.start,
      end_sec: s.end,
    }));

    /* 2️⃣ Translate */
    const translatedSegments = await translateSegmentsBatch(segments);

    console.log("transcript language converted to english successfully..");


    /* 3️⃣ Plan timeline using FRONTEND B-ROLLS */
    const timeline = await planTimeline(translatedSegments, b_rolls);

    console.log("compared translatedSegments and b_rolls successfully ");

    
    

    /* ✅ FINAL RESPONSE */
    res.json({
      timeline,
      transcript: translatedSegments,
    });
        console.log("all operational ");

  } catch (err) {
    console.error("❌ Backend error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("✅ Backend running on http://localhost:3001");
});
