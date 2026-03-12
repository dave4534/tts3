# Voice Reference Clips

Store 6–10 second reference audio clips here for each voice persona.

**Extract clips from source audio:**
```bash
pip install pydub   # and ffmpeg on PATH
python voices/extract_clip.py input.mp3 output.wav --start 30 --duration 8
```

**MVP lineup (see PRD):**
- Calm older man
- Upbeat young woman
- Professional man
- Professional woman
- Gentle young man
- Warm older woman

**Format:** WAV or MP3, normalized volume.
**Source:** LibriVox, Mozilla Common Voice (open-licensed).
