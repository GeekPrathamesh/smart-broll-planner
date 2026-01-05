import fs from "fs";
import path from "path";

export async function transcribeARoll() {
  const jsonPath = path.join(process.cwd(), "tmp", "a_roll.json");

  if (!fs.existsSync(jsonPath)) {
    throw new Error("a_roll.json not found in tmp folder");
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);

  // normalize to required format
  const segments = data.segments.map(seg => ({
    start: Number(seg.start.toFixed(2)),
    end: Number(seg.end.toFixed(2)),
    text: seg.text.trim(),
  }));

  return segments;
}

// -------------
// import fs from "fs";
// import path from "path";
// import axios from "axios";
// import ffmpeg from "fluent-ffmpeg";
// import ffmpegPath from "ffmpeg-static";
// import OpenAI from "openai";
// import { localWhisperTranscribe } from "./localTranscribe.js";
// import { readWhisperOutput } from "./readWhisperOutput.js";

// ffmpeg.setFfmpegPath(ffmpegPath);
// // ---------------------------------

// // const openai = new OpenAI({
// //   apiKey: process.env.OPENAI_API_KEY,
// // });
// // ---------------------------------

// export async function transcribeARoll(videoUrl) {
//   const tmpDir = path.join(process.cwd(), "tmp");
//   if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

//   const videoPath = path.join(tmpDir, "a_roll.mp4");
//   const audioPath = path.join(tmpDir, "a_roll.wav");

//   // 1️⃣ Download video
//   const videoRes = await axios.get(videoUrl, { responseType: "stream" });
//   const writer = fs.createWriteStream(videoPath);
//   videoRes.data.pipe(writer);

//   await new Promise((resolve) => writer.on("finish", resolve));

//   // 2️⃣ Extract audio
//   await new Promise((resolve, reject) => {
//     ffmpeg(videoPath)
//       .noVideo()
//       .audioCodec("pcm_s16le")
//       .audioChannels(1)
//       .audioFrequency(16000)
//       .save(audioPath)
//       .on("end", resolve)
//       .on("error", reject);
//   });
// // ---------------------------------

//   // 3️⃣ Whisper transcription
//   // const transcript = await openai.audio.transcriptions.create({
//   //   file: fs.createReadStream(audioPath),
//   //   model: "gpt-4o-mini-transcribe",
//   //   response_format: "verbose_json",
//   // });

// // -----------------------------------------------
//   await localWhisperTranscribe(audioPath);
// const segments = readWhisperOutput(audioPath);


//   // 4️⃣ Normalize output (sentence-level)
//   // const segments = transcript.segments.map((seg) => ({
//   //   start: Number(seg.start.toFixed(2)),
//   //   end: Number(seg.end.toFixed(2)),
//   //   text: seg.text.trim(),
//   // }));
// // ---------------------------------
//   return segments;
// }
