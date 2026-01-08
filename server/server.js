import express from "express";
import "dotenv/config";
import cors from "cors";
import { transcribeARoll } from "./services/transcribe.js";
import { translateSegmentsBatch } from "./services/translatebatch.js";
import { planTimeline } from "./services/planTimeline.js";
import router from "./routes/generateVideorouter.js";

const app = express();

/* Allow frontend to access backend */
app.use(cors());

/* Accept large JSON payloads (video URLs, metadata) */
app.use(express.json({ limit: "50mb" }));

/* Health check route to verify backend and API key */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    openai_key_loaded: !!process.env.OPENAI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

/* Video rendering routes */
app.use("/api/video", router);

/* Serve generated videos as static files */
app.use("/tmp", express.static("tmp"));

/* Main API that prepares timeline data */
app.post("/api/generate", async (req, res) => {
  try {
    const { a_roll, b_rolls } = req.body;
    console.log("a_roll and b_roll are received");

    /* Check A-roll URL */
    if (!a_roll?.url) {
      return res.status(400).json({ error: "A-roll URL missing" });
    }

    /* Check B-roll list */
    if (!Array.isArray(b_rolls) || b_rolls.length === 0) {
      return res.status(400).json({ error: "B-rolls missing" });
    }

    /* Convert A-roll audio to text */
    const transcript = await transcribeARoll(a_roll.url);

    console.log("extracted mp3 from mp4 successfully & converted to transcript successfully..");

    const segments = transcript.segments.map((s) => ({
      text: s.text,
      start_sec: s.start,
      end_sec: s.end,
    }));

    /* Translate transcript into English */
    const translatedSegments = await translateSegmentsBatch(segments);

    console.log("transcript language converted to english successfully..");

    /* Match transcript with B-rolls and plan timeline */
    const timeline = await planTimeline(translatedSegments, b_rolls);

    console.log("compared translatedSegments and b_rolls successfully ");

    /* Send final processed data to frontend */
    res.json({
      timeline,
      transcript: translatedSegments,
    });

    console.log("all operational ");

  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3001;
/* Start backend server */
app.listen(PORT, () => {
  console.log("Backend running on http://localhost:3001");
});
