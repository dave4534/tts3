# Voice Reference Clips

Store 6–10 second reference audio clips here for each voice persona.

**Extract clips from source audio:**
```bash
pip install pydub   # and ffmpeg on PATH
python voices/extract_clip.py input.mp3 output.wav --start 30 --duration 8
```

**Normalize volume across clips (Task 2.3):**
```bash
python voices/normalize_clips.py clip1.wav clip2.wav --target -3
python voices/normalize_clips.py voices/*.wav --out-dir voices/normalized
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
