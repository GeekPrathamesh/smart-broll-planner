# AI-Assisted Video Generation Backend

## Overview
This project implements a Node.js backend service that automatically plans and optionally renders B-roll insertions into an A-roll (talking-head / UGC) video.

The system analyzes spoken content in the A-roll, understands the semantic meaning of B-roll clips using metadata, and decides **when, where, and why** a particular B-roll should be inserted.  
The focus of this assignment is on **reasoning, system design, and semantic matching**, rather than visual polish.

---

## Core Functionality
- Transcribes A-roll audio with timestamps using OpenAI Whisper
- Translates non-English speech (Hindi / Hinglish) to English
- Matches transcript segments with B-roll metadata using embeddings
- Plans a B-roll insertion timeline using cosine similarity
- Optionally renders the final video using FFmpeg while preserving original A-roll audio

---

## Tech Stack

### Backend
- Node.js
- Express.js
- OpenAI API (Whisper, embeddings, translation)
- FFmpeg (`ffmpeg-static`, `fluent-ffmpeg`)
- Axios, CORS

### Frontend (separate service)
- React
- TypeScript
- Vite
- Tailwind CSS

---

## Project Structure
```yaml
backend/
├── services/
│ ├── transcribe.js
│ ├── translatebatch.js
│ ├── planTimeline.js
│ ├── embed.js
│ └── cosine.js
├── routes/
│ └── generateVideorouter.js
├── tmp/ # Temporary processing files
├── index.js # Server entry point
└── package.json

```

## Environment Setup

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_openai_api_key
PORT=3001
```

Run Instructions
Install dependencies and start the server:

```bash
npm install
node index.js
```
#### The backend server runs at : http://localhost:3001

Health check endpoint:

```bash

GET /health
```

## API Summary
Generate Timeline Plan
```bash

POST /api/generate
```
Input:
```json

{
  "a_roll": {
    "url": "A_ROLL_VIDEO_URL"
  },
  "b_rolls": [
    {
      "id": "1",
      "url": "B_ROLL_VIDEO_URL",
      "metadata": "clip description"
    }
  ]
}```
Output:

```json

{
  "insertions": [
    {
      "start_sec": 12.5,
      "duration_sec": 2.0,
      "broll_id": "broll_3",
      "confidence": 0.78,
      "reason": "Speaker discusses food hygiene concerns, matching uncovered food visuals"
    }
  ]
}
```
## Render Final Video (Optional)
```bash

POST /api/video/create
```
Input:

```json

{
  "a_roll_url": "A_ROLL_VIDEO_URL",
  "insertions": [
    {
      "start_sec": 5,
      "duration_sec": 2,
      "broll_URL": "B_ROLL_VIDEO_URL"
    }
  ]
}
```

## Output
- Final rendered video is saved at `/tmp/{jobId}/final_output.mp4`
- Original A-roll audio remains unchanged
- B-roll overlays are applied based on semantic relevance

## Constraints Followed
- A-roll duration: 30–90 seconds
- Number of B-roll clips: 6
- B-roll insertions: 3–6 per video
- Avoids over-frequent or distracting insertions
- Focus on reasoning and system clarity over UI polish

## Trade-offs & Design Decisions
- Metadata-based B-roll understanding was chosen over vision models to keep the system deterministic, fast, and cost-efficient
- A similarity threshold and spacing constraint reduce noisy or repetitive insertions
- Single-pass FFmpeg rendering prioritizes correctness over performance optimizations

## Notes
- FFmpeg is bundled using ffmpeg-static
- Temporary files are automatically cleaned after processing
- Built strictly for assignment and demonstration purposes
