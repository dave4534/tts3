# Phase 2: Voice Research Guide (Task 2.1)

Guide for browsing LibriVox and Mozilla Common Voice to find speakers matching the MVP voice lineup.

**Reference:** PRD voice lineup in `docs/superpowers/specs/2026-03-12-tts-web-app-prd.md`

---

## MVP Voice Lineup

| Persona | Description |
|---------|-------------|
| Calm older man | Warm, steady, grandfatherly — great for audiobooks |
| Upbeat young woman | Energetic, friendly — good for articles and blogs |
| Professional man | Clear, neutral, newscaster-style |
| Professional woman | Clear, confident, corporate/presentation tone |
| Gentle young man | Soft-spoken, relaxed — good for bedtime stories |
| Warm older woman | Maternal, soothing, storytelling feel |

**Clip requirements:** 6–10 seconds, clean audio, normalized volume. WAV or MP3.

---

## LibriVox

**URL:** https://librivox.org  
**License:** Public domain (USA)  
**Formats:** MP3, Ogg Vorbis (older projects). Files hosted on Archive.org.

### How to browse

1. **By catalogue** — https://librivox.org/search (filter by language: English)
2. **By narrator** — Project pages list the reader; click through to their catalogue
3. **Solo readings** — One narrator = consistent voice, easier to extract a clean clip

### Search strategy by persona

- **Calm older man** — Classic literature audiobooks, solo male readers; look for steady pacing
- **Upbeat young woman** — Light fiction, YA, memoirs; energetic readers
- **Professional man** — Non-fiction, history, journalism-style books
- **Professional woman** — Business/self-help, TED-style narrators
- **Gentle young man** — Children's books, poetry, calm fiction
- **Warm older woman** — Storytelling, memoirs, cozy fiction

### Downloading

- Individual chapters: 64 kbps or 128 kbps MP3 from the project page
- Full book zip: from project page or Archive.org
- Extract a 6–10 second segment from a clean, minimally-backgrounded section

---

## Mozilla Common Voice

**URL:** https://commonvoice.mozilla.org (contribute)  
**Dataset download:** https://datacollective.mozillafoundation.org/ (Mozilla Data Collective)  
**License:** CC0 (public domain)

### Dataset structure

- **Releases:** Full and delta releases; English datasets are large (tens of GB)
- **TSV files:** `validated.tsv` lists clips with transcriptions and speaker metadata
- **Columns of interest:**
  - `client_id` — Speaker ID (same speaker = same ID across clips)
  - `path` — Clip filename
  - `age` — Optional: `teens`, `twenties`, `thirties`, `forties`, `fifties`, `sixties`, `seventies`
  - `gender` — Optional: `male`, `female`, `other`
  - `accent` — Optional
  - `up_votes`, `down_votes` — Prefer clips with high up_votes

### Search strategy by persona

Use `validated.tsv` and filter by `age` + `gender`, then sample clips per `client_id`:

| Persona | Suggested filters |
|---------|-------------------|
| Calm older man | `gender=male`, `age` in `fifties`, `sixties`, `seventies` |
| Upbeat young woman | `gender=female`, `age` in `teens`, `twenties`, `thirties` |
| Professional man | `gender=male`, `age` in `thirties`, `forties` |
| Professional woman | `gender=female`, `age` in `thirties`, `forties` |
| Gentle young man | `gender=male`, `age` in `teens`, `twenties`, `thirties` |
| Warm older woman | `gender=female`, `age` in `fifties`, `sixties`, `seventies` |

**Note:** Demographics are self-declared and optional; many clips lack age/gender. Listen and verify fit.

---

## Recommended workflow

1. **List candidates** — Note LibriVox project URLs + narrator names, or Common Voice `client_id`s
2. **Listen** — Ensure clean audio, minimal noise, clear speech
3. **Extract** — Use `voices/extract_clip.py` to cut a 6–10 second segment at a sentence/phrase boundary (Task 2.2)
4. **Normalize** — Use `voices/normalize_clips.py` for consistent volume across clips (Task 2.3)
5. **Store** — Save to `voices/` with filenames per Task 2.4: `calm-older-man.wav`, etc.
6. **Manifest** — `voices/voices.json` (Task 2.5) lists id, name, description, filename

### Extracting clips (Task 2.2)

```bash
# Requires: pip install pydub; ffmpeg on PATH
python voices/extract_clip.py source.mp3 voices/calm-older-man.wav --start 45 --duration 8
# Or with M:SS: --start 1:30
```

---

## Log (optional)

Use this table to track findings as you browse:

| Persona | Source | Identifier (e.g. LibriVox project, CV client_id) | Notes |
|---------|--------|--------------------------------------------------|-------|
| Calm older man | | | |
| Upbeat young woman | | | |
| Professional man | | | |
| Professional woman | | | |
| Gentle young man | | | |
| Warm older woman | | | |
