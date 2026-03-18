# Skills & Domain Knowledge

Reference for AI coding assistants working on this project.

---

## Key Libraries

### Chatterbox Multilingual (TTS Engine)
- **Docs:** https://github.com/resemble-ai/chatterbox
- **Modal example:** https://modal.com/docs/examples/chatterbox_tts
- **Model:** 0.5B parameters, MIT licensed
- **Voice cloning:** Zero-shot from 6-second reference audio clip
- **Languages:** 23 including English and Hebrew
- **Chunk limit:** ~300 characters per call — must chunk and stitch longer text
- **Long text handling:** See https://github.com/devnen/Chatterbox-TTS-Server for chunking patterns

### Modal (Serverless Backend + GPU)
- **Docs:** https://modal.com/docs
- **Pricing:** Per-second billing, $30/mo free tier, A10G ~$1.10/hr
- **Key patterns:**
  - `@modal.asgi_app()` — serve a full FastAPI app on Modal (this is our backend)
  - `@modal.function()` — define CPU or GPU functions
  - `.map()` — parallel execution across multiple inputs
  - `modal.Image` — define container image with dependencies (ffmpeg, pydub, PyMuPDF, etc.)
- **Cold starts:** 1-4 seconds typical
- **Important:** Modal hosts BOTH the API and GPU workers. There is no separate backend service.

### FastAPI (API Framework)
- **Docs:** https://fastapi.tiangolo.com
- **Key patterns:** async endpoints, `UploadFile` for file handling, background tasks
- **Runs on:** Modal via `@modal.asgi_app()` (not a separate server)

### PyMuPDF (PDF Parsing)
- **Docs:** https://pymupdf.readthedocs.io
- **Import as:** `import fitz`
- **Why not PyPDF2:** Better handling of complex layouts, multi-column, tables

### Tailwind CSS + Shadcn UI (Frontend Styling)
- **Tailwind:** https://tailwindcss.com — utility-first CSS
- **Shadcn:** https://ui.shadcn.com — accessible, copy-paste components built on Radix UI + Tailwind
- **Note:** Shadcn requires Tailwind. Use Shadcn for buttons, cards, progress bars, inputs; use Tailwind utilities for layout and custom styling.
- **Init:** Run `npx shadcn@latest init` in the frontend directory after Vite + Tailwind are set up.

### pydub + ffmpeg (Audio Stitching)
- **Docs:** https://github.com/jiaaro/pydub
- **Runs on:** Modal GPU functions (ample RAM available)
- **ffmpeg:** Must be installed in the Modal image

---

## Architecture Awareness

- **Modal:** Hosts everything backend — API endpoints (CPU), TTS generation (GPU), audio stitching (GPU). Scales to zero, per-second billing, $30/mo free tier.
- **Vercel free tier:** Hosts the React frontend. Global CDN, automatic deploys from Git.
- **No Render, no separate backend.** The entire backend is Modal.

---

## Common Pitfalls

1. **Don't create a separate backend service** — everything runs on Modal
2. **Don't process chunks sequentially** — use Modal's `.map()` for parallel batches (except where `.cursorrules` explicitly calls for sequential processing in a single GPU container for long-form jobs)
3. **Don't use PyPDF2** — use PyMuPDF (`fitz`) for reliable PDF extraction
4. **Chunk at sentence boundaries** — don't split mid-word or mid-sentence (causes audio artifacts)
5. **Voice clips must be normalized** — inconsistent volume across clips = bad UX
6. **CORS** — Modal-hosted FastAPI must allow the Vercel frontend origin, configure early
7. **Bundle voice clips in the Modal image** — they're static assets, include them at build time

---

## Adding a New TTS Persona

Use this checklist whenever you add a new selectable voice.

1. **Pick/prepare the clip**
   - Source audio from an open-licensed dataset (e.g. LibriVox, Common Voice) or a curated internal file.
   - Trim a **6–10 second** segment with consistent tone and minimal background noise.
   - Convert to **WAV** (e.g. 16 kHz or 22.05 kHz), normalize volume to roughly match existing clips.
   - Save under `voices/` with a descriptive filename, e.g. `calm-older-man.wav` or `Ram-Dass.wav`.

2. **Register in `voices/voices.json`**
   - Add an entry with:
     - `id`: machine id (e.g. `"calm-older-man"` or `"ram-dass"`),
     - `name`: display name,
     - `description`: short UX copy,
     - `filename`: exact WAV filename.
   - Keep ids stable; frontend and backend both use `id` as the `voice_id`.

3. **Deploy and mount**
   - Ensure `voices/` is mounted in the Modal images (already done in `modal_app/main.py` via `add_local_dir("voices", ...)`).
   - Run `python3 -m modal deploy modal_app/main.py` from the project root so the new clip + manifest are available in the container.

4. **Verify via API**
   - Call `GET /voices` and confirm the new persona appears with a non-null `preview_url`.
   - Call `GET /voices/preview/{voice_id}` and listen to the clip; check for:
     - Correct voice,
     - Reasonable loudness vs. other personas,
     - No obvious artifacts at start/end.

5. **Test conversions**
   - On the frontend, select the new voice and:
     - Convert a short text (2–3 sentences),
     - Optionally convert a longer text to ensure the long-form pipeline works with this `voice_id` as well.
   - Listen for:
     - Style matching the reference clip,
     - No major glitches or volume jumps between sections.

5.5. **(Optional) Tune conditioning for accent/style fidelity**
   Chatterbox tends to follow the *text language* for pronunciation/accent more than the *reference clip* for accent.
   When a voice’s reference accent “drifts” (e.g. your voice sounds too different from the reference), tune conditioning parameters **empirically per voice**.

   - Parameters to try (voice-specific, not “one size fits all”):
     - `cfg_weight`: how strongly the model conditions on the reference clip.
     - `exaggeration`: controls the reference “prosody/expression” strength.
     - `temperature`: sampling temperature (usually keep at default for first pass).
   - Run a small sweep to find a better `cfg_weight` for this voice:
     - Generate audition MP3s using the modal helper:
       - `modal run modal_app/main.py::generate_cfg_weight_sweep_for_voice --voice-id <id>`
       - (Default sweep uses `0.25,0.5,0.75` and writes to `voices/experiments/<voice_id>-cfg-sweep/`.)
     - Listen to the `cfg_weight_*` files and record which one best matches the reference accent.
     - Treat results as **specific to this voice**; do not apply a found value to all voices without re-checking.
   - Update the shipped preview audio for this voice (so the UI “Play” button matches your experiment):
     - Copy the chosen output:
       - `voices/experiments/<voice_id>-cfg-sweep/cfg_weight_<X>.mp3` -> `voices/<voice_id>-preview.mp3`
     - Redeploy the Modal backend.
     - Hard refresh the frontend (or otherwise bypass cache) before listening again.
   - Keep a small per-voice experiment log (manual note is fine):
     - Suggested fields: `voice_id`, reference clip name, `text` used for audition, `cfg_weight`, `exaggeration`, `temperature`, subjective match rating (e.g. `1-5`), and 1–2 lines of “what sounded wrong” (pronunciation, rhythm, accent drift).
     - Where to put it: `voices/experiments/<voice_id>-cfg-sweep/notes.md` (create alongside the autogenerated `manifest.json`).
   - Apply the chosen params to real jobs:
     - Use `POST /convert` with optional JSON fields:
       - `cfg_weight`
       - `exaggeration`
       - `temperature`
     - The backend passes these values through to Chatterbox generation.

6. **Document**
   - When a new persona is fully wired and tested, add a brief entry to `CHANGELOG.md` and, if relevant, update `docs/PROJECT_STATUS.md` to reflect the new voice.
