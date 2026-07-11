## Overview
Mouthpiece is a 3–5 player cooperative puzzle that inverts every party game's talking dynamic. The host TV shows a puzzle only ONE player — the Speaker — can operate, by voice. Everyone else holds a private clue needed to solve it, but their phones gag them: the moment a non-Speaker vocalizes, their own phone penalizes the team. The knowers must guide a blindfolded mouth using only gestures, pointing, and phone-flashes.

## Problem
Cooperative party puzzles collapse into the loudest person solving it while everyone shouts over each other. Mouthpiece forces a clean division: the person with the microphone knows nothing; the people with knowledge can't use their voices. It manufactures the exact tension the "reward silence, punish talking" theme wants — the answer is right there in three people's heads and none of them can just *say* it.

## How it works
The host TV displays, say, a 4-dial lock. Only the Speaker can move dials — by saying "dial two, up" (speech-to-text on the Speaker's phone drives the host). The Speaker has NO idea what the combination is. Each other phone privately shows one constraint: "dial 3 is even," "dial 1 < dial 4," "the sum is 12." Non-Speakers must convey these silently — pointing at the TV, holding up fingers, flashing their phone screen red/green as the Speaker guesses aloud. Every non-Speaker phone runs its own mic and, on any vocalization from its owner, deducts a strike or freezes that clue's giver for 10s. Reward silence: the team's only channel is the Speaker's mouth; punish talking: a knower who blurts "twelve!" costs the team.

PRIVATE per phone: your single constraint (non-Speakers), your live mic-gag warning, a flash toggle. The Speaker's phone privately shows only the mic and a transcript of what it heard. SHARED on host: the lock, current dial state, strike count, timer.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: Room{puzzleState:{dials[]}, strikes, timer}, Player{id, role, constraint}. The Speaker's phone uses the Web Speech API (SpeechRecognition) → parsed commands → server → host dial updates. Every non-Speaker phone runs WebAudio RMS VAD calibrated to room floor and emits {playerId, vocalized} only for its owner. The hard part is dual-purpose mic handling: the Speaker's mic must transcribe intended commands while non-Speaker mics must reject the Speaker's voice bleeding across the room (relative near-field threshold + margin), plus low-latency host-state sync so the flash-guidance loop (Speaker guesses → knower flashes green) feels immediate (<150ms round-trip).

## v1 scope
- 3 players: one Speaker, two clue-holders, one round.
- A 3-dial lock, one constraint per non-Speaker.
- Speaker drives via speech-to-text; non-Speakers get one flash toggle + their private constraint.
- Per-phone mic gag with 3-strike loss.

## Out of scope
- Multiple puzzle types, rotating the Speaker role across rounds.
- Rich gesture recognition (pointing is done with real fingers, not tracked).
- Handling non-English speech commands.

## Risks & unknowns
- Speech-to-text latency/accuracy in a noisy room could frustrate the Speaker — may need a constrained grammar ("dial N up/down").
- Non-Speaker mics false-triggering on the Speaker's loud commands; relative-threshold tuning is the key unknown.
- Two silent guidance channels (point + flash) may be too thin; playtest whether teams can actually converge without voice.

## Done means
Three phones join; one becomes Speaker and can move the host TV's dials by voice; the other two each see a private constraint and can flash guidance; when a clue-holder blurts the answer aloud their *own* phone logs a strike, and a team that solves the lock through silent guidance alone sees a win on the host screen.
