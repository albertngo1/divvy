## Overview
Monitor is a hidden-role audio deduction game for 4-5 players, each wearing their own earbuds. In live sound, a "monitor mix" is the private in-ear feed each performer hears — and every one can be different. Monitor weaponizes that: everyone listens to the *same* short clip, except one person's feed is subtly altered, and the group must sniff out who's describing a song no one else heard.

## Problem
Hidden-role games are almost always visual or textual — a doctored dossier, a swapped word. Auditory perception is untapped, yet arguing about what you *heard* (a lyric, an instrument, a key change) is one of the most confidently-wrong things humans do. Monitor turns that everyday disagreement into a mechanic.

## How it works
The host TV shows only a title card, a countdown, and later the voting UI — it plays no audio. On a synced GO, every phone streams a ~20-second clip privately to that player's earbuds. Four players hear the canonical mix; one player (who does NOT know they're the imposter) hears a **B-mix** with exactly one change: a single swapped lyric word, an added cowbell hit, a two-second reversed phrase, or a one-line key shift.

Then the host runs a discussion round, surfacing 3 pointed questions one at a time: "What was the last word of the chorus?" "Did anyone hear a cowbell?" "Was the ending higher or lower than the start?" Players answer aloud. On the swapped detail, the imposter's honest answer diverges from the majority — and because three others agree, the truth anchors itself. Finally each phone shows a blind vote for "who heard something different." Reveal.

Private (phone): the audio stream + answer inputs + vote. Shared (host): timer, questions, aggregate vote, reveal.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: a `Room` holds `players[]`, a `clipId`, and an `imposterId`; each clip ships as two pre-bundled audio files (A-mix, B-mix). On start the server assigns B-mix to one random client and A-mix to the rest, then broadcasts a `play` event. Sync between phones is NOT required — each feed is private, so a phone just plays its assigned file locally on receipt; that removes the usual hard real-time problem. The genuinely hard part is **content**: authoring clip-variant pairs where the single change is catchable-but-not-glaring, and preventing leakage (enforce earbuds via a mic-check that fails if playback is detected on speaker; keep loudness matched so the imposter can't guess from artifacts).

## v1 scope
- 4 players, earbuds mandatory
- One 20-second clip with a single swapped lyric word
- 3 fixed host questions
- One blind vote, one reveal
- Original/CC-licensed stems only

## Out of scope
- Scoring, multiple rounds, matchmaking
- "Imposter knows" bluffing variant
- Licensed commercial music
- Auto-generated variants

## Risks & unknowns
- Every player needing earbuds is real adoption friction
- Speaker playback leaks the game instantly
- A single swapped detail may be too subtle to catch, or too obvious
- Loudness/latency artifacts could tip off the imposter

## Done means
Four phones each play their assigned clip privately, exactly one receives the B-mix, the discussion runs, and across playtests the blind vote identifies the odd-one-out meaningfully above chance — with non-imposters able to name the specific detail that gave it away.
