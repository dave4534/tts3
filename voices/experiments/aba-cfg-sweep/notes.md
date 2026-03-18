# Aba cfg_weight sweep notes

## Round 1 (default preview update)
- Chosen `cfg_weight`: `0.75`
- `exaggeration`: `0.5`
- `temperature`: `0.8`
- Audition text: `This is a short preview of this voice.`
- Promoted files:
  - `cfg_weight_0_75.mp3` -> `voices/aba-preview.mp3`

## What to do if this sounds wrong
- Re-generate another sweep (or just pick another cfg_weight from the existing sweep files):
  - Next candidates: `0.25`, `0.5`, `1.0`
- Copy the corresponding `cfg_weight_<X>.mp3` into `voices/aba-preview.mp3`
- Redeploy backend so the Modal container sees the updated `voices/` mount
- Hard refresh the frontend to bypass cached preview audio

## Round 2 (higher cfg_weight)
- Generated cfg sweep with:
  - `cfg_weight`: `1.25,1.5,1.75,2.0`
  - `exaggeration`: `0.5`
  - `temperature`: `0.6`
- Chosen `cfg_weight` for this round: `2.0`
- Promoted files:
  - `cfg_weight_2_0.mp3` -> `voices/aba-preview.mp3`

## Round 3 (lower exaggeration)
- Generated cfg sweep with:
  - `cfg_weight`: `2.0` (single candidate)
  - `exaggeration`: `0.0`
  - `temperature`: `0.3`
- Promoted files:
  - `cfg_weight_2_0.mp3` -> `voices/aba-preview.mp3`

## Round 4 (safe low cfg_weight)
- Generated cfg sweep with:
  - `cfg_weight`: `0.1, 0.25, 0.5, 1.0`
  - `exaggeration`: `0.5`
  - `temperature`: `0.3`
- Promoted files:
  - `cfg_weight_0_25.mp3` -> `voices/aba-preview.mp3`

## Round 5 (accent-sensitive text)
- Single-candidate run:
  - `cfg_weight`: `2.0`
  - `exaggeration`: `1.0`
  - `temperature`: `0.2`
- Audition text:
  - `This is the third Thursday. This that three—thank you, Amir. Farah drives a van; love is near. Shalom, mazal tov, Nowruz.`
- Promoted files:
  - `cfg_weight_2_0.mp3` -> `voices/aba-preview.mp3`

