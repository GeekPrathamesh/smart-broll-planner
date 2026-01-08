import express from "express";
import fs from "fs";
import axios from "axios";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";
import ffmpegPath from "ffmpeg-static";

const router = express.Router();

/* Temp folder where all job files will be stored */
const TMP_ROOT = path.resolve(process.cwd(), "tmp");

if (!fs.existsSync(TMP_ROOT)) {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
}

/* Generates unique id for each video job */
const uid = () => crypto.randomBytes(8).toString("hex");

/* Runs FFmpeg command and waits until it finishes */
const runFFmpeg = (args) =>
  new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error("FFmpeg binary not found"));
    }

    const ff = spawn(ffmpegPath, args);

    ff.stderr.on("data", (d) => {
      console.log("FFmpeg:", d.toString());
    });

    ff.on("error", (err) => {
      reject(new Error("FFmpeg failed to start: " + err.message));
    });

    ff.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });

/* Downloads a video file and retries if it fails */
const downloadFile = async (url, outputPath, retries = 3) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 30_000,
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

  } catch (err) {
    if (retries > 0) {
      console.warn(`Retry downloading ${url} (${retries} left)`);
      return downloadFile(url, outputPath, retries - 1);
    }
    throw err;
  }
};

/* API to generate final video with B-roll overlays */
router.post("/create", async (req, res) => {
  const jobId = uid();
  const JOB_DIR = path.join(TMP_ROOT, jobId);

  try {
    fs.mkdirSync(JOB_DIR, { recursive: true });

    const { insertions, a_roll_url } = req.body;

    /* Validate required input */
    if (!a_roll_url || !insertions?.length) {
      return res.status(400).json({
        error: "a_roll_url or insertions missing",
      });
    }

    const aRollPath = path.join(JOB_DIR, "a_roll.mp4");
    const outputPath = path.join(JOB_DIR, "final_output.mp4");

    /* Download main A-roll video */
    await downloadFile(a_roll_url, aRollPath);

    const brollPaths = [];

    for (let i = 0; i < insertions.length; i++) {
      const raw = path.join(JOB_DIR, `broll_${i}.mp4`);
      const cut = path.join(JOB_DIR, `broll_${i}_cut.mp4`);

      /* Download and trim B-roll */
      await downloadFile(insertions[i].broll_URL, raw);

      await runFFmpeg([
        "-y",
        "-i", raw,
        "-t", String(insertions[i].duration_sec),
        "-an",
        cut,
      ]);

      brollPaths.push(cut);
    }

    /* Build FFmpeg overlay filter */
    let filterGraph = "";
    let lastVideo = "[0:v]";

    insertions.forEach((ins, i) => {
      const start = ins.start_sec;
      const end = ins.start_sec + ins.duration_sec;

      filterGraph +=
        `[${i + 1}:v]` +
        `setpts=PTS-STARTPTS+${start}/TB,` +
        `scale=iw:ih,format=rgba[b${i}];` +
        `${lastVideo}[b${i}]overlay=` +
        `enable='between(t,${start},${end})'` +
        `[v${i}];`;

      lastVideo = `[v${i}]`;
    });

    filterGraph = filterGraph.slice(0, -1);

    /* Render final video keeping A-roll audio */
    await runFFmpeg([
      "-y",
      "-i", aRollPath,
      ...brollPaths.flatMap((p) => ["-i", p]),
      "-filter_complex", filterGraph,
      "-map", lastVideo,
      "-map", "0:a",
      "-c:v", "libx264",
      "-pix_fmt", "yuv420p",
      "-c:a", "copy",
      outputPath,
    ]);

    res.json({
      success: true,
      output: `tmp/${jobId}/final_output.mp4`,
    });

    /* Cleanup temp files after some time */
    setTimeout(() => {
      fs.rmSync(JOB_DIR, { recursive: true, force: true });
    }, 120_000);

    console.log("all done successfully..");
    

  } catch (err) {
    fs.rmSync(JOB_DIR, { recursive: true, force: true });

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
