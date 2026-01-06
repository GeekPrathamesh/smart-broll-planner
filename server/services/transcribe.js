import fs from "fs";
import path from "path";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import OpenAI from "openai";

ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeARoll(videoUrl) {
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  const videoPath = path.join(tmpDir, "a_roll.mp4");
  const audioPath = path.join(tmpDir, "a_roll.wav");

  // Download video
  const videoRes = await axios.get(videoUrl, { responseType: "stream" });
  await new Promise(resolve => {
    videoRes.data.pipe(fs.createWriteStream(videoPath)).on("finish", resolve);
  });

  // Extract audio
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

  // ✅ Whisper transcription with timestamps
  const transcript = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    response_format: "verbose_json",
  });

  return transcript;
}
