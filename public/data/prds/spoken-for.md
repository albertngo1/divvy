## Overview
A 3-player, one-round talking game for people who enjoy watching someone circumlocute themselves into a corner. The TV shows a shared Lexicon of twelve very ordinary words. Any Lexicon word spoken aloud by anyone is struck through and dead for the rest of the game. You want three specific words to survive; you want one specific word to die.

## Problem
Most "don't say the word" games (Taboo, Watch Ya Mouth) treat the banned list as a private penalty. Nobody has made the vocabulary a shared *commons* that everyone is simultaneously depleting and defending, where the resource being consumed is the room's own ability to talk. As words die, conversation gets structurally harder — the game tightens its own noose.

## How it works
Three players, 3 minutes. Public on the TV: the 12-word Lexicon (deliberately mundane — *water, chair, door, phone, minute, blue, dog, money, road, cold, hand, out*), each word live-struck the instant it's detected.

Private on each phone:
- **Protect (3 words):** +4 points each if still alive at the buzzer.
- **Demand (1 word):** +8 if a *different* player says it. 0 if you say it yourself.
- **Alibi (1 use):** a 15-second window where your own speech doesn't kill words — spend it to bait hard.

The forcing function: the TV issues a public Task every 45 seconds that genuinely requires talking ("agree out loud on the worst room in this house," "describe what's behind you"). Failing to complete a Task docks everyone 5. So the room must talk, using speech that dodges twelve of the most common words in English, while each person is steering the conversation toward one word and away from three — and the protect/demand sets overlap in ways nobody can see.

The delicious failure: baiting someone toward *money* often drags *out* and *hand* along with it, and you may be the only one who cared about those.

## Technical approach
Host tab + phone PWA + PartyKit Durable Object. Data model: `Room{lexicon[12], dead[], task, taskEndsAt}`, `Phone{protect[3], demand, alibiUsedAt}`.

Each phone runs on-device streaming ASR (Web Speech API where available, whisper-tiny via transformers.js as fallback) plus an AudioWorklet RMS envelope. **The transcript never leaves the phone.** Phones emit only `{lexiconIndex, tMs, rmsPeak}` — a word index and a loudness, nothing else. This is both a privacy property and a bandwidth one.

The hard part is deduplicated attribution: all three phones hear "door," so the server clusters detections within a 600ms window on the same index and credits the phone with the highest normalized rmsPeak (normalized by the lobby's per-phone "say your name" calibration). Homophone and stem handling — *phones/phoned*, *cold/called* — needs a hand-tuned match list per word; ASR false positives are the single biggest correctness risk, so a word only dies on a detection with confidence ≥0.6, and the TV animates a 400ms "strike pending" so the room sees causality.

## v1 scope
- Exactly 3 players, one 3-minute round, one fixed 12-word Lexicon
- 3 hardcoded Tasks on a 45s timer, host clicks to mark a Task complete
- Alibi: one button, 15s, no cooldown logic
- TV: Lexicon with strikethroughs, task text, countdown
- Reveal screen: everyone's protect/demand sets and final scores

## Out of scope
- 4+ players, generated lexicons, whisper-mode, word resurrection, rematch flow

## Risks & unknowns
- ASR on noisy party audio may miss ~20% of utterances; a miss feels like a bug and a false strike feels like a cheat, and the second is far worse
- Players may just go near-silent and eat the Task penalty; Task penalty must be tuned above the value of one Protect word
- Homophone tuning is per-word manual labor and doesn't generalize

## Done means
Three phones and a TV in a real room: at least 6 of 12 words die in 3 minutes, at least one player successfully baits their Demand word out of someone else, the room reports no false strike they could name, and no raw transcript ever appears in a server log.
