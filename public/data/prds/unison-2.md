## Overview
Unison is a cooperative, voice-driven party game for 3–6 people around a shared host screen (TV/laptop). The team's job is to collectively *sing a chord into tune* against a wobbling reference tone. Each player's phone is both a private sheet-music stand and a private tuner: it assigns you one note and listens to your voice alone. For friend groups who like Spaceteam's frantic mutual dependence but want something sillier and more physical — actual humans humming and correcting each other by ear.

## Problem
Most voice party games reduce voice to a push-to-talk button or a trivia answer. The *sound itself* is never the game. Unison makes the analog audio signal — pitch, drift, and the beating of two close voices — the literal win condition, and hides just enough that no one can solo their way to victory.

## How it works
The host screen shows a slowly detuning 'signal': a spectrum meter with 3–4 target pitch bands that drift and wobble. The team must hold all bands in tune simultaneously for 4 continuous seconds to 'lock' the signal.

Each **phone (private)** shows: your assigned target note (e.g. 'hum an A'), a needle showing ONLY your own sharp/flat error (measured by that phone's own mic via local pitch detection), and — critically — *not* what anyone else is doing. Some players are secretly assigned the **same** note; when two same-note voices are close but not identical you hear physical beating, and neither phone can tell you which of you is the flat one. You have to talk: 'Am I high? Come down with me.'

The **host screen (shared)** shows the blended result — which bands are locked green, which are red/empty — but never attributes error to a person. So the only feedback loop that finds the culprit is voices in the room.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ targetChord, phase, lockTimer }`, `Player{ id, assignedNote, currentCents, onTarget:bool }`. Each phone runs pitch detection locally (Web Audio `AnalyserNode` + autocorrelation/YIN) at ~20 Hz and sends only `{playerId, cents, onTarget}` — no raw audio, keeping bandwidth trivial. The Durable Object aggregates per-band coverage and broadcasts the shared meter state at 15–20 Hz. The genuinely hard part: reliable monophonic pitch detection on cheap phone mics in a noisy room with crosstalk from other singers — needs a noise gate, confidence threshold, and octave-error correction so a flat singer isn't flagged as on-pitch an octave down.

## v1 scope
- One round, one fixed 3-note chord, 3–4 players.
- Local pitch detection + a single needle per phone.
- Host shows 3 bands + a 4-second lock timer + win screen.
- Two players deliberately share a note to force the 'kill the beating' moment.

## Out of scope
- Multiple chords / songs / progressions.
- Scoring, streaks, difficulty ramps.
- Any raw-audio streaming to the host.

## Risks & unknowns
- Phone-mic pitch accuracy in a live room may be too jittery to feel fair.
- Non-singers may find it too skill-gated (mitigate with wide cents tolerance).
- Latency between local detection and shared meter could feel laggy.

## Done means
3 people on 3 phones can hum their assigned notes, watch the shared meter turn green only when all are in tune, hold it 4 seconds to win, and — in playtest — the same-note pair audibly argues about who's flat before locking. Verified via one live session on real phones.
