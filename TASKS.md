# TTS Web App — Build Checklist

> Reference: `docs/superpowers/specs/2026-03-12-tts-web-app-prd.md`
> After completing each task, mark it `[x]` and add a one-line summary to `CHANGELOG.md`.

---

## Phase 0: Project Setup

- [x] **0.1** Initialize Git repo and create `.gitignore` (Node, Python, .env, __pycache__, etc.)
- [x] **0.2** Scaffold React frontend with Vite + Tailwind CSS + Shadcn UI
- [x] **0.3** Set up Modal account and install `modal` CLI. Verify with `python3 -m modal run hello.py` (output: "Hello from Modal!").
- [ ] **0.4** Create a Vercel account and link to the frontend repo (for deployment later)
- [x] **0.5** Establish project folder structure:
  ```
  /frontend        → React + Tailwind + Shadcn (Vite)
  /modal_app       → Modal backend: FastAPI API + GPU worker (single deployment)
  /voices          → Reference audio clips (6-10 sec each)
  /docs            → PRD and specs
  ```

---

## Phase 1: Modal GPU Worker (Chatterbox TTS)

> Build the TTS engine first — everything else depends on it.

- [x] **1.1** Create Modal function that loads Chatterbox Multilingual model and generates audio from a single text chunk + voice reference clip
- [x] **1.2** Test single-chunk generation end-to-end on Modal (text in → WAV/MP3 out)
- [x] **1.3** Add parallel batch processing: accept a list of chunks, process in parallel, return ordered audio segments
- [x] **1.4** Add audio stitching on Modal: concatenate all chunk audio into a single MP3 using pydub + ffmpeg
- [x] **1.5** Add progress reporting: Modal function yields chunk-level progress updates during processing
- [x] **1.6** Test full pipeline on Modal: 1,000+ word input → parallel chunks → stitched MP3 output

---

## Phase 2: Voice Reference Clips

- [ ] **2.1** Browse LibriVox and Mozilla Common Voice for speakers matching each persona (see PRD voice lineup)
- [ ] **2.2** Extract clean 6-10 second clips for each of the 6 voices
- [ ] **2.3** Normalize audio levels across all clips (consistent volume)
- [ ] **2.4** Store clips in `/voices` directory with descriptive filenames
- [ ] **2.5** Create `voices.json` manifest: id, name, description, filename for each voice
- [ ] **2.6** Test each voice clip with Modal worker — verify output quality

---

## Phase 3: Backend API (FastAPI on Modal)

> The API runs on Modal via `@modal.asgi_app()` — no separate backend service needed.

- [ ] **3.1** Create FastAPI app served via `@modal.asgi_app()` on Modal
- [ ] **3.2** Create health check endpoint (`GET /health`)
- [ ] **3.3** Create text submission endpoint (`POST /convert`): accepts JSON body with text + voice ID, returns a job ID
- [ ] **3.4** Add file upload support to `/convert`: accept .txt and .pdf files (max 10 MB)
- [ ] **3.5** Implement text extraction: plain read for .txt, PyMuPDF for .pdf
- [ ] **3.6** Implement text chunking: split input into ~300 character chunks at sentence boundaries
- [ ] **3.7** Implement word count validation (reject >20,000 words)
- [ ] **3.8** Dispatch chunks to GPU worker functions for parallel TTS generation + stitching
- [ ] **3.9** Create progress endpoint (`GET /job/{job_id}/status`): returns percentage and state (queued, warming_up, processing, complete, failed)
- [ ] **3.10** Create download endpoint (`GET /job/{job_id}/download`): serves the completed MP3
- [ ] **3.11** Create voice list endpoint (`GET /voices`): returns voice manifest + serves preview clips
- [ ] **3.12** Add temporary file cleanup: delete completed MP3s older than 30 minutes
- [ ] **3.13** Add error handling: retry failed chunks (up to 3x), return user-friendly error messages per PRD
- [ ] **3.14** Add CORS configuration for frontend origin
- [ ] **3.15** Test full flow: upload text → get job ID → poll progress → download MP3

---

## Phase 4: Frontend (React + Tailwind + Shadcn)

- [ ] **4.1** Set up project structure: pages, components, hooks, utils
- [ ] **4.2** Implement warm & friendly design system: color palette, rounded corners, soft shadows, typography (see PRD style guide)
- [ ] **4.3** Build text input component: large textarea with live word counter ("4,230 / 20,000 words"), word counter turns red over limit
- [ ] **4.4** Build file upload component: drag-and-drop zone + button, accepts .txt/.pdf (max 10 MB), populates textarea with extracted text
- [ ] **4.5** Build voice selection component: horizontal card row (vertical on mobile), each card has name, description, play button for 6-sec preview, highlighted border on selection, one pre-selected by default
- [ ] **4.6** Build convert button: large CTA, disabled state when no text or voice, loading state
- [ ] **4.7** Build progress bar component: percentage display, "Warming up..." state, animated fill
- [ ] **4.8** Build audio player component: play/pause, scrub bar, timestamp display (appears after conversion)
- [ ] **4.9** Build download button and "Start Over" reset link
- [ ] **4.10** Wire up API integration: submit text → poll progress → display result
- [ ] **4.11** Add error handling UI: display backend error messages, retry button, file validation messages
- [ ] **4.12** Implement responsive layout: test on mobile widths (375px, 390px, 414px) and desktop
- [ ] **4.13** Add loading state for initial Modal cold start ("Warming up...")

---

## Phase 5: Integration Testing

- [ ] **5.1** Test end-to-end: paste short text (~100 words) → select voice → convert → preview → download
- [ ] **5.2** Test end-to-end: upload .txt file → convert → download
- [ ] **5.3** Test end-to-end: upload .pdf file → convert → download
- [ ] **5.4** Test 20,000 word input: verify chunking, progress, and final output
- [ ] **5.5** Test all 6 voices produce distinct, quality output
- [ ] **5.6** Test error cases: oversized file, over word limit, scanned PDF, empty input, unsupported file type
- [ ] **5.7** Test mobile responsiveness on real devices or device emulator
- [ ] **5.8** Test cold start experience: Modal wake-up flow

---

## Phase 6: Deployment

- [ ] **6.1** Deploy Modal app to production (`modal deploy` — deploys both API and GPU workers)
- [ ] **6.2** Deploy React frontend to Vercel (set Modal API URL as environment variable)
- [ ] **6.3** Verify public URL works end-to-end
- [ ] **6.4** Test from a mobile device on the public URL
- [ ] **6.5** Verify Modal costs align with estimates after a few test conversions
