import fs from "fs";
import path from "path";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import crypto from "crypto";
import { buildSegments } from "../buildSegments.js";

ffmpeg.setFfmpegPath(ffmpegPath);

const GOOGLE_API_KEY = process.env.GOOGLE_SPEECH_API_KEY;

export async function transcribeARoll(videoUrl) {
  const jobId = crypto.randomBytes(8).toString("hex");
  const jobDir = path.join(process.cwd(), "tmp", jobId);
  fs.mkdirSync(jobDir, { recursive: true });

  const videoPath = path.join(jobDir, "a_roll.mp4");
  const audioPath = path.join(jobDir, "a_roll.wav");

  const videoRes = await axios.get(videoUrl, { responseType: "stream" });
  await new Promise(resolve => {
    videoRes.data.pipe(fs.createWriteStream(videoPath)).on("finish", resolve);
  });

  await new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo()
      .audioCodec("pcm_s16le")
      .audioChannels(1)
      .audioFrequency(16000)
      .save(audioPath)
      .on("end", resolve)
      .on("error", reject);
  });

  const audioBytes = fs.readFileSync(audioPath).toString("base64");

  const res = await axios.post(
    `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
    {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "hi-IN",
        enableWordTimeOffsets: true,
        enableAutomaticPunctuation: true
      },
      audio: { content: audioBytes }
    }
  );

  let allSegments = [];

  res.data.results.forEach(r => {
    const alt = r.alternatives[0];
    const segments = buildSegments(alt.words, alt.transcript);
    allSegments.push(...segments);
  });

  // Convert to required format
  const formattedSegments = allSegments.map(s => ({
    text: s.text,
    start_sec: s.start,
    end_sec: s.end
  }));

  setTimeout(() => {
    fs.rmSync(jobDir, { recursive: true, force: true });
  }, 60000);

  return {
    segments: formattedSegments
  };
}

