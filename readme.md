# Smart B-Roll Inserter for UGC Videos

A full-stack application that analyzes an A-roll talking-head video, semantically matches it with provided B-roll clips, and generates an explainable timeline plan for B-roll insertion.  
The system can optionally render a final video using FFmpeg while preserving the original A-roll audio.

---

## Purpose

This project automates B-roll planning for UGC-style videos by replacing manual, intuition-based editing with a deterministic and explainable pipeline.

The system determines:
- which B-roll to insert,
- when it should appear,
- and why it is relevant to the spoken content.

The primary output is a structured timeline plan. Video rendering is included as an optional validation step.


## Technology Stack

### Backend
 - Node.js
 - Express.js
 - FFmpeg (ffmpeg-static)
 - OpenAI APIs
 - Whisper (transcription)
 - Chat Completions (translation)
 + GPT-4o-mini (deterministic JSON translation) 
 - Embeddings (semantic matching)

### Frontend
 - React
 - TypeScript
 - Vite
 - Tailwind CSS
 - shadcn/ui

### Project Structure
```pgsql
Copy code
.
├── server/
│   ├── routes/
│   │   └── generateVideorouter.js
│   ├── services/
│   │   ├── transcribe.js
│   │   ├── translatebatch.js
│   │   ├── planTimeline.js
│   │   ├── embed.js
│   │   └── cosine.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   ├── public/
│   ├── vite.config.ts
│   └── vercel.json
```

## Running the Project Locally

### Prerequisites

 - Node.js v18 or higher 
 - OpenAI API key


### Backend Setup
```bash

cd server
npm install
```

### Create a .env file in backend/:

```env

OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### Start the backend server:

```bash

npm run dev
```

### Backend will run at:

```arduino

http://localhost:3001

```

### Frontend Setup
``` bash

cd frontend
npm install
```

### Create a .env file in frontend/:

```env

VITE_BACKEND_URL=http://localhost:3001
```

### Start the frontend:

```bash
cd frontend
npm run dev
```
Frontend will run at:

```arduino

http://localhost:8080
```

## System Flow

1. A-roll video URL is provided by the frontend
2. Audio is extracted from the A-roll using FFmpeg
3. Whisper generates a timestamped transcript
4. Transcript segments are translated to English if required
5. Transcript segments and B-roll metadata are embedded
6. Cosine similarity is used to match segments with B-roll clips
7. Timeline constraints are applied
8. A structured JSON timeline is returned
9. (Optional) FFmpeg overlays B-roll clips onto the A-roll video

---

## Output Format

```json
{
  "timeline": {
    "insertions": [...]
  },
  "transcript": [...]
}

```
#### Each insertion includes timing, confidence score, and a human-readable explanation.

## Constraints Applied
 - Minimum gap of 3 seconds between B-roll insertions
 - Each B-roll clip is used at most once
 - Similarity threshold > 0.3
 - B-roll duration is capped by transcript segment length

## API Endpoints

- **`GET /health`**  
  Returns backend status and confirms availability of the OpenAI API key.

- **`POST /api/generate`**  
  Accepts A-roll and B-roll inputs, generates the transcript, and produces a structured B-roll timeline plan.

- **`POST /api/video/create`**  
  Invokes the FFmpeg rendering pipeline to generate the final video with B-roll overlays.

- **`GET /tmp/*`**  
  Serves generated video files for preview or download.


## Video Rendering Details
 - B-roll clips are trimmed to planned durations
 - Overlays are applied using FFmpeg filter graphs
 - Original A-roll audio is preserved
 - Output video is encoded using H.264
 - Temporary files are cleaned up automatically after processing.

## Design Decisions
 - Metadata-based semantic matching was chosen over vision models for determinism and speed
 - Single-pass FFmpeg rendering prioritizes correctness over advanced effects
 - Translation is performed before embedding to ensure consistent semantic space
 - All matching decisions are explainable and confidence-scored

 ---

# Author

**Prathamesh Teli**  
 - 9423341615  
 - Email : prathameshteli727@gmail.com


