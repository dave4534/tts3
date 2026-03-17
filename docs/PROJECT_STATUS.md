# TTS Web App — Architecture & Status (Mid‑Project)

> Source of truth for current architecture, progress, major issues, and updated goals.  
> For product details, see `docs/superpowers/specs/2026-03-12-tts-web-app-prd.md`.  
> For tasks, see `TASKS.md`. For change history, see `CHANGELOG.md`.

---

## 1. High‑Level Summary

- **Product**: Single‑page text‑to‑speech web app. Users paste text or upload `.txt`/`.pdf`, select a voice, convert to MP3 with progress + inline player + download.
- **Status**: Core MVP implemented end‑to‑end. Long‑form support (tested up to ~14k words) now working via parent/section jobs. Frontend UI is complete and deployed.
- **Stack**:
  - **Frontend**: React + TypeScript + Vite + Tailwind + Shadcn UI, deployed on Vercel.
  - **Backend**: Python / FastAPI served via `@modal.asgi_app()` on Modal.
  - **TTS**: Chatterbox Multilingual (`from chatterbox.tts import ChatterboxTTS`) running on Modal A10G GPU.
  - **Parsing / Audio**: PyMuPDF (`fitz`) for PDF, `pydub` + `ffmpeg` for stitching.
- **Infra**: Only two services:
  - Vercel (frontend)
  - Modal (API + GPU worker + storage for temporary MP3s)

Public frontend: `https://tts3-beryl.vercel.app/`  
Backend API (Modal): `https://dave4534--tts-api.modal.run`

---

## 2. Current Architecture

### 2.1 Backend (Modal)

**Key file**: `modal_app/main.py`

- **Images**:
  - GPU image: Debian + Python 3.11 + `chatterbox-tts`, `torch`, `torchaudio`, `pydub`, `ffmpeg` and bundled demo voices.
  - Web image: Debian + Python 3.11 + `fastapi`, `uvicorn`, `python-multipart`, `pymupdf`, plus mounted `voices/`.
- **State**:
  - `job_store = modal.Dict("tts-jobs")` — in‑memory job records.
  - `completed_jobs = modal.Dict("tts-completed-jobs")` — used for cleanup bookkeeping.

### 2.2 GPU TTS class

**Class**: `ChatterboxTTS` (`@app.cls(gpu="a10g", image=image, secrets=[hf-token])`)

- Loads `ChatterboxTTS.from_pretrained(device="cuda")` once per container.
- Methods:
  - `generate(text, voice_path) -> bytes` — single chunk → WAV.
  - `generate_batch(chunks, voice_path) -> list[bytes]` — parallel batch (used in earlier phases).
  - `stitch(wav_segments) -> mp3_bytes` — pydub concatenation.
  - `generate_and_stitch(chunks, voice_path)` — batch + stitch convenience.
  - `generate_and_stitch_with_progress(chunks, voice_path)` — **current main path**:
    - Calls `self.model.prepare_conditionals(voice_path)` **once** before the loop.
    - Iterates chunks sequentially, generating WAV, exporting to bytes, and yielding progress updates.

### 2.3 Job model (long‑form)

Implemented in Phase 3 extension (3.16–3.19):

- **Section splitting**:
  - `split_text_into_sections(text, max_words=SECTION_MAX_WORDS=1000) -> list[str]` — word‑based sections for long‑form jobs.
  - `chunk_text(text, max_chars=300)` — character‑based, sentence‑aware chunks for feeding the TTS model.
- **Helpers**:
  - `build_parent_and_section_jobs(parent_id, text, voice_id, max_words)` → `(parent_job, section_jobs)`.
  - `compute_parent_progress(section_jobs)` → average of section `progress`.
  - `summarize_parent_state(parent_job, section_jobs)` → aggregate parent `state`, `progress`, `error`.
- **Job shapes**:
  - **Parent job** (`kind: "parent"`):
    - Fields: `id`, `kind`, `text`, `voice_id`, `section_ids: list[str]`, `state`, `progress`, `error`, `mp3`.
  - **Section job** (`kind: "section"`):
    - Fields: `id`, `kind`, `parent_id`, `index`, `text`, `voice_id`, `state`, `progress`, `error`, `mp3`.

### 2.4 Pipelines

- **Short/medium inputs (≤ 1,000 words)**:
  - `/convert` creates a **single job** in `job_store`.
  - `run_tts_pipeline.spawn(job_id)`:
    - Normalizes text, chunks with `chunk_text`.
    - Uses `ChatterboxTTS.generate_and_stitch_with_progress.remote_gen`.
    - Updates `job_store[job_id]` with `state` and `progress` (and final `mp3`).
    - On success: marks job `state="complete"`, `progress=100`, stores `mp3`, adds entry to `completed_jobs`.
    - On error: marks job `state="failed"`, with full error string (used to debug timeouts, etc.).

- **Long‑form inputs (> 1,000 and ≤ 20,000 words)**:
  - `/convert`:
    - Generates `parent_id`.
    - Calls `build_parent_and_section_jobs(parent_id, text, voice_id, max_words=1000)`.
    - Writes parent + all section jobs into `job_store`.
    - Spawns `run_section_pipeline.spawn(section_id)` for each section.
    - Returns `{ job_id: parent_id }` to the frontend (same contract).
  - `run_section_pipeline(section_id)`:
    - Only operates on `kind == "section"`.
    - Sets `state="warming_up" → "processing"`, chunks section text (~300 chars).
    - Runs `generate_and_stitch_with_progress`, mirroring the single‑job behavior.
    - On success: marks section `state="complete"`, `progress=100`, stores section `mp3`, and records completion in `completed_jobs`.
    - On error: marks section `state="failed"`, with error string.
  - `/job/{job_id}/status`:
    - If parent: loads section jobs, calls `summarize_parent_state`, **persists** the aggregated state/progress/error back onto the parent in `job_store`, then returns the summary.
    - If non‑parent: returns legacy single‑job state.
  - `/job/{job_id}/download`:
    - If parent:
      - Requires `state == "complete"`.
      - If `mp3` already cached on parent, returns it.
      - Otherwise, loads all section jobs, ensures they’re `complete` and have `mp3`, concatenates section MP3s byte‑wise into one final MP3, caches it on the parent, and returns it.
    - If non‑parent: returns the single‑job `mp3` as before.

### 2.5 Frontend

- **Key pieces** (all under `frontend/src/`):
  - `lib/api.ts`: wraps calls to `/health`, `/voices`, `/convert`, `/job/{id}/status`, and build of download/preview URLs. Uses `VITE_TTS_API_URL` (defaulting to the Modal URL) as base.
  - `components/VoiceSelector.tsx`: renders voice cards from `/voices` response, supports preview via `/voices/preview/{voice_id}`.
  - Main page:
    - Text area with live word counter (`x / 20,000`).
    - File upload (`.txt` / `.pdf`, 10 MB), populating textarea with extracted text.
    - Voice selection grid (including dev voice "Lucy").
    - Convert button, progress bar with “Warming up…” state, inline audio player, download button, and “Start Over”.
    - Error banner that surfaces backend `error` field (including Modal timeout messages).

---

## 3. Progress by Phase

### Phase 0–2 (Setup + voices)

- Repo, tooling, Modal + Vercel wiring complete.
- Voice clips concept + `voices/voices.json` manifest in place, with the first curated persona voice (Ram-Dass-style) fully wired through previews and `/convert` using `Ram-Dass.wav` as the reference clip.

### Phase 3 (Backend API) — **Status: Core + long‑form done**

- **3.1–3.15**: FastAPI app on Modal, `/convert` (text + files), chunking, word limit, GPU dispatch, status + download, `/voices`, cleanup cron, retries, error handling, CORS, and an E2E test entrypoint.
- **3.16–3.18**: Long‑form helpers (`split_text_into_sections`, parent/section job shapes, progress aggregation) plus unit tests (`modal_app/test_longform_helpers.py`, `modal_app/tests/test_parent_state.py`, `modal_app/tests/test_section_pipeline.py`).
- **3.19**: Section pipeline + parent aggregation wired into `/convert` and status/download; tested in both unit tests and real 14k‑word conversions.
- **3.20 (open in TASKS)**: Formalize a long‑form **E2E test for 15–20k words** (e.g., as a `@app.local_entrypoint` or pytest integration) so we have regression coverage, not just manual validation.

### Phase 4 (Frontend) — **Status: Complete**

- All tasks 4.1–4.13 are implemented: structure, design system, input, upload, voices, convert, progress bar, player, download/reset, API wiring, error handling, responsive layout, and cold‑start UX.

### Phase 5 (Integration Testing) — **Status: Planned**

Still to be done systematically:

- Short text E2E (happy path).
- `.txt` and `.pdf` upload flows.
- Explicit 20k‑word test (beyond the manual ~14k run).
- All 6 voices coverage.
- Error cases: oversize file, over word limit, scanned PDF, empty input, unsupported file type.
- Mobile responsiveness on actual devices.
- Modal cold start and wake‑up experience from the public URL.

### Phase 6 (Deployment) — **Status: Partially done**

- Modal app is already deployed and in active use for dev.
- Vercel frontend is deployed and usable at `tts3-beryl.vercel.app`.
- Remaining checklist items focus on:
  - Treating the current deploy as “production”: end‑to‑end verification on the public URL.
  - Real‑device testing on mobile.
  - Monitoring actual Modal costs under realistic usage and comparing to PRD estimates.

---

## 4. Major Bugs Encountered & Resolved

### 4.1 Modal 300s timeout on long jobs

- **Symptom**: Long chapter conversions (~5k–20k words) would:
  - Show progress creeping slowly (e.g., 0 → 7%), then
  - Fail with error: `Task's current input ... hit its timeout of 300s`.
- **Root cause**: Each `/convert` request was a **single Modal input** with all text; Modal enforces a ~300s per‑input timeout. Large jobs simply couldn’t finish within 5 minutes.
- **Fix / architectural change**:
  - Introduced **parent + section jobs**, where each section is ~1,000 words and runs as its own Modal function invocation, comfortably under the 300s limit.
  - Aggregated progress and state on the parent, so the frontend still sees a single job.
  - Result: A ~14k‑word text now completes successfully, and usage stays within Modal’s constraints.

### 4.2 Parent job not marked complete (download blocked)

- **Symptom**: For long‑form jobs, frontend progress reached 100%, but:
  - Play button did nothing.
  - Download returned `{"detail":"Job not complete"}`.
- **Root cause**:
  - `/job/{id}/status` was computing aggregated state/progress from sections but **not persisting** that summary back into the parent job in `job_store`.
  - `/job/{id}/download` checked `job.get("state") != "complete"` and (correctly) refused to serve the MP3 because the stored state was still `"queued"`/`"processing"`.
- **Fix**:
  - In the parent branch of `job_status`, after `summarize_parent_state`, we now write an updated parent record back into `job_store` with the aggregated `state`, `progress`, and `error`.
  - Download logic now sees the parent as `complete` and either returns the cached MP3 or stitches section MP3s on demand.

### 4.3 Chatterbox API and GPU usage pitfalls

- **Symptoms / risks addressed**:
  - Mis‑importing `chatterbox.tts_turbo` (module doesn’t exist).
  - Calling `prepare_conditionals(voice_path)` on **every chunk**, causing GPU hangs on later chunks.
  - Using `.starmap` across containers, incurring heavy reload costs and potential hangs.
- **Fixes / rules** (codified in `.cursorrules`):
  - Import: `from chatterbox.tts import ChatterboxTTS`.
  - Call `model.prepare_conditionals(voice_path)` **once** before looping over chunks.
  - Process chunks **sequentially** in a single GPU container for long‑form runs; do not `.starmap()` across containers.

---

## 5. Known Limitations (MVP)

- **Job state durability**: Stored in Modal `Dict` (in‑memory). Container restarts can lose in‑flight jobs; user must retry.
- **Voices**:
  - Lucy (dev) voice is always available from the demo zip.
  - Persona voices (`calm-older-man`, etc.) rely on corresponding `.wav` files under `voices/`; if some clips are missing or low quality, those personas degrade.
  - No user voice uploads / cloning (explicitly **out of scope** for MVP).
- **Max length**:
  - Backend still enforces a hard cap of **20,000 words**.
  - Real‑world behavior is validated up to ~14k words; a formal 20k test is still to be added.
- **Cost / Modal limits**:
  - Free tier: $30/mo credits, 10 concurrent GPUs.
  - Heavy testing with large texts can burn credits quickly; concurrency should be used carefully during development.
- **Persistence**:
  - MP3s are only kept temporarily (cleanup cron clears them after ~30 minutes).
  - No user accounts or history; each session is stateless from the user’s perspective.

---

## 6. Updated Goals & Next Steps

Short‑term goals (within current MVP scope):

1. **Finish Phase 3.20**:
   - Add an automated long‑form E2E test (~15–20k words) to guard against regressions in the parent/section pipeline.
2. **Run Phase 5 integration tests**:
   - Systematically walk through 5.1–5.8 in `TASKS.md`, especially:
     - 20k‑word input behavior,
     - error cases,
     - mobile and cold‑start experience via the Vercel URL.
3. **Treat the current deployment as a “preview production”**:
   - Use it like a real user would,
   - Observe Modal cost and latency behavior under realistic usage,
   - Capture any UX or reliability issues for a potential “Phase 7: Polish” list.

Longer‑term (post‑MVP, only if PRD is updated):

- Persistent job history, user accounts, or custom voices.
- More sophisticated cost controls (quality tiers, caching, alternate TTS backends).
- Better observability (structured logging, simple monitoring of job failures and durations).

