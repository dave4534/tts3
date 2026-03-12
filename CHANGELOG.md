# Changelog

All notable changes to this project will be documented in this file.
Format: `[Task ID] One-line summary`

---

## MVP Build

- [0.1] Created `.gitignore` (Node, Python, .env, __pycache__, build outputs, IDE/OS)
- [0.2] Scaffolded React frontend with Vite + Tailwind CSS + Shadcn UI in `/frontend`
- [0.3] Modal CLI verified; `hello.py` runs successfully on Modal
- [0.5] Created `/modal_app` (placeholder main.py) and `/voices` (README for clip storage)
- [1.1] ChatterboxTTS GPU class: loads model, generate(text, voice_path) → WAV bytes; sample voices in image; requires `hf-token` secret
- [1.2] Single-chunk TTS test passed; `modal run modal_app/main.py` produces /tmp/tts-output.wav
- [1.3] Added generate_batch(): accepts list of chunks, processes via starmap, returns ordered WAV segments; `modal run modal_app/main.py::test_batch` writes chunk_000.wav … to /tmp/tts-batch/
- [1.4] Added stitch() and generate_and_stitch(); pydub concatenates WAV segments to single MP3; `modal run modal_app/main.py::test_pipeline` produces /tmp/tts-output.mp3
- [1.5] Added generate_and_stitch_with_progress(): yields progress per chunk; `modal run modal_app/main.py::test_progress` writes /tmp/tts-output-progress.mp3
- [1.6] Full pipeline test: chunk_text() at sentence boundaries, test_full_pipeline with 1,000+ words → 22 chunks → stitched MP3; `modal run modal_app/main.py::test_full_pipeline` produces /tmp/tts-full-output.mp3
- [2.1] Created docs/phase2-voice-research-guide.md: LibriVox and Mozilla Common Voice browse/search strategies per persona
- [0.3] Set up Modal account and installed `modal` CLI
