## Overview
Foley is a 3-5 player concurrent-room party game where the group builds a single anonymous *soundscape* for a silent looping scene. It's for people who love making dumb noises with their mouths and hands, and want a shareable audio keepsake at the end instead of a scoreboard.

## Problem
Group creativity games are almost all text or drawing. Sound is the funniest, most intimate medium at a party — a badly-hummed door creak, a mouth-trumpet — but there's no toy for it because you can't record five people at once with one device without everyone hearing (and pre-judging) each other. The surprise dies. Per-phone private recording is the only way to preserve the reveal.

## How it works
The host TV plays a short silent looping storyboard (~6s): e.g. *rainy alley → footsteps → a door opens → a cat*. The server assigns each phone ONE cue slot with a private brief ("you are the DOOR, 0:03-0:04").

**Phone (private):** shows only *your* cue, a waveform timeline highlighting your 1-second window, and a big record button. You perform your sound (voice, hands, tapping a mug) and can re-take privately as many times as you like. You never hear anyone else's take.

**Host (shared):** shows the scene, a row of anonymous "armed" lights (grey → green as each phone locks a take), and a countdown. Once all locked, the host stitches every clip onto the scene timeline and plays the assembled soundscape aloud — the first time anyone hears the whole thing.

Then a light anonymity round: each phone privately guesses who performed which cue. You "win" by staying unidentified — but there's no points tally, just a reveal. The host offers the mixed reel as a downloadable file: the keepsake.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{sceneId, cues:[{slot, brief, phoneId, clipReady}], phase}`. Phones record locally via `MediaRecorder` (Opus/WebM), upload the small blob to the server keyed by slot; host pulls all blobs at assembly. Sync strategy: the server only broadcasts *armed/locked* booleans during recording (never audio) to preserve surprise; assembly and playback are host-side using WebAudio `AudioBufferSourceNode`s scheduled against one clock so cues land in their windows.

Genuinely hard part: **latency-tolerant alignment.** Clips are recorded free-hand, so trim each to its assigned window and quantize onsets to the slot grid on the host. Mic-gain normalization across wildly different phones (RMS-normalize each buffer) keeps one loud phone from swamping the mix.

## v1 scope
- 3 players, one fixed 6s scene, exactly 3 cue slots.
- Record → lock → host assembles → plays once → download reel.
- Anonymity guess round optional, no scoring UI.

## Out of scope
- Multiple scenes / scene picker.
- Volume/pan editing, effects.
- Re-mix or re-order after reveal.
- Persistent gallery.

## Risks & unknowns
- Mobile `MediaRecorder`/mic-permission quirks across iOS Safari.
- Free-hand timing may feel sloppy even after quantization.
- Room noise bleeding into every mic simultaneously.

## Done means
Three phones each record one clip privately, the host plays a single assembled soundscape that all three hear for the first time together, and the mixed reel downloads as one audio file.
