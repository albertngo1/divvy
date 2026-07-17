## Overview
Tell is a phone-based party game for 4–10 people where each round someone secretly outsources their written answer to an AI, and the group votes on who cheated. The twist: the scoring is built around the danger of *false accusation*, not detection.

## Problem
Three feed items rhyme: Pseudpocalypse (a coming flood of AI pseudonyms), "Detecting LLM-Generated Texts with Classical ML," and "The Misclassification of Autistic Writing as AI-Generated." The last one is the itch — we're building a culture that punishes people for writing *distinctively human* by calling it machine output. Every existing 'spot the bot' game rewards trigger-happy accusation. Tell inverts the incentive so the lesson is felt, not lectured.

## How it works
Everyone gets the same prompt ("describe the smell of a hardware store"). Secretly, one or two players are dealt a Ghost card: they must submit whatever a provided AI model returns, unedited. Everyone else writes their own. Answers appear anonymized. Players privately vote who they think was a Ghost. Scoring: correctly fingering a Ghost = +1. Falsely voting a genuine human = −2 to you, and +2 to the accused ("mistaken for a machine"). Ghosts score by *surviving* unvoted. So the dominant strategy is not paranoia — it's noticing that plain, hedged, symmetrical prose is the real tell, while a weird, specific, misspelled human answer is bait you must resist. A round-end reveal shows the AI-detector's own guess versus the room's, and it's often wrong too.

## Technical approach
Stack: a single Node/Bun server with WebSocket rooms and a mobile web client (no install); room code join like Jackbox. The Ghost answers come from one API call per Ghost per round (Claude Haiku) with a system prompt tuned to sound plausibly casual. Optional offline mode uses a small local model. A lightweight 'house detector' — a classical logistic-regression classifier over cheap features (burstiness, hedge-word frequency, punctuation entropy, type-token ratio), exactly the "classical ML" approach from the HN post — runs on every submission and is shown at reveal *specifically to be beaten*, driving home how unreliable it is. Data model: `Room{players, round, prompts}`, `Submission{playerId, text, isGhost, detectorScore}`, `Vote{voter, accused}`. Hardest part is prompt-tuning the AI so it's catchable-but-not-trivial, and keeping human answers anonymous when friends recognize each other's voice.

## v1 scope
- Room creation + join by code
- One built-in prompt deck (~40 prompts)
- One Ghost per round, API-backed
- Inverted scoring with the false-accusation penalty
- Reveal screen showing the classical detector's guess

## Out of scope
- Accounts, persistence, matchmaking
- The local-model offline path
- Anti-collusion / spectator mode

## Risks & unknowns
Balance: if the AI is too obvious the game is boring; too good and rounds stalemate. The false-accusation penalty must be large enough to actually change behavior without feeling punishing. Voice recognition among close friends can leak identity.

## Done means
Six people in one room can play three full rounds on their phones, the inverted scoring correctly rewards a wrongly-accused human, and the reveal screen shows at least one round where the classical detector disagreed with both the room and the truth.
