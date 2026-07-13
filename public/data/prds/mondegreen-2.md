## Overview
Mondegreen is a fast, funny local-multiplayer party game built on the thing that just got good and cheap: fast on-device speech-to-text (Apple's SpeechAnalyzer / Whisper-tiny). Each round shows every player a secret target phrase. You then say *anything* — usually gibberish or a weird sentence — into your phone, and the winner is whoever gets the recognizer to transcribe their audio closest to the target. Turning a serious accessibility tool into a mischievous toy about the machine's ears.

## Problem
Speech recognition is treated as an oracle of truth, but it's hilariously gameable — it hears "a nudist play" as "a new display," collapses homophones, and hallucinates confident garbage. Nobody has made this failure mode *fun*. Existing party games are trivia or drawing; there's a wide-open lane for a voice game whose whole joy is the specific, repeatable quirks of a real ASR model.

## How it works
Pass-and-play or same-room-with-phones. A round: the app reveals the target phrase (e.g. "recognize speech") to all players. In turn, each records up to 5 seconds; the on-device recognizer transcribes it live. Score = similarity between the transcript and the target (word-level + phonetic distance). Highest similarity wins the round; ties broken by fewest syllables spoken (elegance bonus). Best of N. A "cursed" variant hides the target and gives only a category, so you're reverse-engineering what the model *wants* to hear. The comedy is in reading everyone's actual transcripts aloud afterward.

## Technical approach
iOS-first (SpeechAnalyzer, on-device, offline) with a web fallback using whisper-tiny via transformers.js/WebGPU, or the Web Speech API where available. All recognition runs locally — no audio leaves the device. Scoring blends normalized Levenshtein on the transcript token stream with a phonetic distance (Double Metaphone / a lightweight grapheme-to-phoneme + edit distance) so near-homophones score high even when spelling differs; a syllable-count tiebreak rewards concise trickery. Target phrases are a curated bank chosen for exploitable homophones. The genuinely hard part is *fairness and determinism*: same model version, same decoding settings, and accent-robust scoring so a heavy accent isn't auto-penalized — plus picking targets that are winnable-but-not-trivial across the model's known mishearing patterns (built by fuzzing the recognizer offline against a phrase corpus).

## v1 scope
- iOS app, pass-and-play, one phone
- 50 curated target phrases with known exploitable homophones
- Live transcription + blended similarity score + round winner
- "Read the transcripts aloud" reveal screen

## Out of scope
- Online/remote multiplayer, matchmaking, accounts
- Multiple languages (English v1)
- Anti-cheat beyond same-device same-model guarantees

## Risks & unknowns
- Model updates could shift mishearing behavior and rebalance the phrase bank; pin a model version.
- Accent/mic variance affecting fairness — mitigate with phonetic scoring and playtests across voices.
- Is it fun for more than 15 minutes, or a one-laugh novelty? Needs the cursed/hidden-target mode to have legs.

## Done means
Four people in a room can play a best-of-5 with no setup beyond installing the app, the recognizer runs fully offline, and in playtesting at least one round per game produces an out-loud laugh at a transcript — with target phrases winnable by multiple distinct nonsense inputs (verified: each v1 phrase has ≥3 known winning utterances).
