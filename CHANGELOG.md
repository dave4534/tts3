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
- [0.3] Set up Modal account and installed `modal` CLI
