## Overview
Countersign is a 3-4 player cooperative voice game of spy authentication under time pressure. The host TV is a map of guard posts with links flickering between players; each phone is one sentry's private codebook. Knowledge is split: whoever challenges holds the challenge word, whoever answers holds the lookup table — but riddled with decoys.

## Problem
We wanted a Spaceteam-style panic that lives entirely in split private knowledge and the ear. Existing relays (call-and-response, ring-whisper) tend to be memorizable or one-directional. Here the pairing is random each beat, the answer table is deliberately confusable, and you can only authenticate by listening precisely to a *specific* person over the room noise.

## How it works
The game must authenticate a queue of LINKS (ordered player pairs) before a shared clock expires. The HOST SCREEN shows the current active link glowing (e.g. "POST 1 → POST 3") and a progress bar of links cleared, plus a global countdown. It shows NO words.

Each PHONE privately shows: (1) your CHALLENGE deck — when you're the challenger, a single challenge phrase appears ("Broken Arrow"); (2) your RESPONSE table — a private list of challenge→countersign rows, seeded with near-miss decoys ("Broken Arrow → NIGHTJAR," "Broken Arms → NIGHTFALL," "Bent Arrow → NIGHThawk"). When the host lights POST 1 → POST 3, player 1 reads their challenge aloud; player 3 scans their private table, picks the row that matches what they heard, and shouts the countersign while tapping it. Server checks: correct row for that exact challenge → link authenticated, next link lights. Wrong countersign → alarm blip, short lockout on that link. Because tables overlap across players and are full of decoys, mishearing "Arrow" vs "Arms" fails you — forcing crisp voice and confirmation.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{ links:[{from,to,challengeId,status}], clock }`; per player `challenges[]` and `responseTable:[{challengeId, correctSign, decoySigns[]}]`. Server owns the link queue and reveals the challenge phrase ONLY to the current `from` player and the response options ONLY to the `to` player (they tap, not type). Sync: server advances the active link on success; broadcasts only link status + progress to host, privacy-filtered decks to phones. Hard part: authoring challenge/response sets whose decoys are phonetically adjacent enough to reward careful speech but not so cruel they're unfair — plus lockout tuning so a wrong answer costs momentum without stalling. No speech recognition; the tap is the input, voice is the human channel.

## v1 scope
- 3 players, 6 links in the queue, 90s clock.
- One curated pack of ~12 challenge/countersign rows with hand-tuned decoys.
- Tap-to-answer; single win (queue cleared) / lose (clock out).

## Out of scope
- 4th player, multiple packs, escalating simultaneous links.
- Traitor/impostor variant, scoring beyond win/lose.
- Reconnect handling, speech parsing.

## Risks & unknowns
- Decoy difficulty is a knife-edge; needs playtesting to avoid feel-bad misfires.
- With only 3 players, random pairings may feel repetitive over 6 links — may need to force variety.
- Room noise could make "listen to one specific person" harder than fun; a per-link "who's challenging" highlight on the host mitigates.

## Done means
Three phones join; the host lights one link at a time; the challenger sees a phrase only they can read, the responder finds and taps the matching countersign among decoys by ear, and the room clears the 6-link queue before the clock — with a wrong-by-one-word answer provably rejected.
