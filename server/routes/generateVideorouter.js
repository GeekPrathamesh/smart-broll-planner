import express from "express";
import fs from "fs";
import axios from "axios";
import path from "path";
import { spawn } from "child_process";
import crypto from "crypto";

const router = express.Router();

/* ---------- Utils ---------- */

const TMP_ROOT = path.resolve(process.cwd(), "tmp");

if (!fs.existsSync(TMP_ROOT)) {
  fs.mkdirSync(TMP_ROOT, { recursive: true });
}

const uid = () => crypto.randomBytes(8).toString("hex");

const runFFmpeg = (args) =>
  new Promise((resolve, reject) => {
    const ff = spawn("ffmpeg", args);

    ff.stderr.on("data", (d) =>
      console.log("FFmpeg:", d.toString())
    );

    ff.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`FFmpeg exited with ${code}`))
    );
  });

const downloadFile = async (url, outputPath, retries = 3) => {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 30_000, // 30s timeout
    });

    await new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

  } catch (err) {
    if (retries > 0) {
      console.warn(`⚠️ Retry downloading ${url} (${retries} left)`);
      return downloadFile(url, outputPath, retries - 1);
    }
    throw err;
  }
};


/* ---------- POST /api/video/create ---------- */

router.post("/create", async (req, res) => {
  const jobId = uid();
  const JOB_DIR = path.join(TMP_ROOT, jobId);

  try {
    fs.mkdirSync(JOB_DIR, { recursive: true });

    const { insertions, a_roll_url } = req.body;

    if (!a_roll_url || !insertions?.length) {
      return res.status(400).json({
        error: "a_roll_url or insertions missing",
      });
    }

    /* ---------- Paths ---------- */

    const aRollPath = path.join(JOB_DIR, "a_roll.mp4");
    const outputPath = path.join(JOB_DIR, "final_output.mp4");

    /* ---------- Download A-roll ---------- */

    await downloadFile(a_roll_url, aRollPath);

    /* ---------- Prepare B-rolls ---------- */

    const brollPaths = [];

    for (let i = 0; i < insertions.length; i++) {
      const raw = path.join(JOB_DIR, `broll_${i}.mp4`);
      const cut = path.join(JOB_DIR, `broll_${i}_cut.mp4`);

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

    /* ---------- Build Filter Graph ---------- */

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

    console.log("✅ Filter Graph:\n", filterGraph);

    /* ---------- Final Render ---------- */

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

    /* ---------- Cleanup after 1 min ---------- */
    setTimeout(() => {
      fs.rmSync(JOB_DIR, { recursive: true, force: true });
    }, 60_000);
    console.log("done");
    

  } catch (err) {
    console.error("❌ Video render error:", err);
    fs.rmSync(JOB_DIR, { recursive: true, force: true });

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
