import { exec } from "child_process";
import path from "path";

export function localWhisperTranscribe(audioPath) {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(audioPath);

    const command = `whisper "${audioPath}" --model small --output_format json --output_dir "${outputDir}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
}




