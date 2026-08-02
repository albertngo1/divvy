## Overview
Off Book is a 4-player, one-round game for a shared host screen plus phone controllers and one earbud per player. From outside, it looks like four people staring at each other in dead silence. Privately, it is a knife fight: each phone is a channel for injecting synthesized speech into exactly one other person's ear, and the first player to make an audible sound loses.

## Problem
Silence games have no *content* — they're endurance, and endurance is boring after ninety seconds. Off Book gives the room a full, vicious conversation while the actual air stays silent. The only speech in the room is synthetic, private, and weaponized, which makes staying quiet an active skill rather than a passive one.

## How it works
Everyone wears one earbud (the other ear stays open, so the room's silence is audible). The host TV shows four name plates and a **Pot** that grows every second all four players remain silent.

Each phone privately shows: a text box, a target selector (the other three names), and your own **Composure** bar. You type a line — a taunt, a lie, a stupid question — and send it. The server renders it through the browser SpeechSynthesis API **on the recipient's phone only**, into their earbud, in a flat neutral voice, unattributed. You hear things nobody else in the room hears, aimed at you, and you must not laugh, gasp, or say "what?".

Each phone runs voicing detection on its owner's own mic. Any voiced sound above threshold for 150 ms = **cracked**. The TV shows only that a plate went dark — no reason, no attribution. The cracked player keeps playing as a **Ghost**: they can still type and still inject, but they can no longer win, which makes them a pure agent of chaos.

Last unbroken player takes the Pot. Post-round, the TV replays every line with its author and target — the round's real transcript, revealed all at once.

Per-phone is load-bearing in the strongest sense: routing different audio to different ears simultaneously is the game. A single passed phone destroys it completely.

## Technical approach
Host browser tab + phone PWAs + PartyKit Durable Object. State: `{pot, players: {id, alive, composure}, lines: [{from, to, text, t}]}`. Lines route server-side; the recipient's phone receives `{text}` with no author and calls `speechSynthesis.speak()` locally — no audio streaming, no TTS service, no latency budget to defend.

Mic detection is fully on-device: AudioWorklet, A-weighted RMS plus autocorrelation-based voicing, threshold calibrated during a 5 s room-tone measurement at start (threshold = noise floor + 12 dB). The phone reports only a `cracked` event, never audio.

The genuinely hard part is **false positives from your neighbour's earbud leakage and from your own phone's speaker**: at 30 cm a leaky earbud can trip the wrong detector. Mitigations: require *voicing* (periodic pitch), not just level; suppress detection on a phone for 400 ms after it starts speaking its own TTS; and gate on a cross-device check — the server discards a crack if another device registered higher energy in the same 200 ms bucket.

## v1 scope
- Exactly 4 players, one round, hard 3-minute cap.
- Type → pick target → send. One line in flight per player at a time.
- Room-tone calibration, crack detection, Ghost state, Pot, end-of-round transcript reveal.

## Out of scope
- Multiple rounds, voice selection, moderation/filtering, spectators, more than 4 phones, any scoring beyond the Pot.

## Risks & unknowns
- Earbud requirement is real friction — one missing pair kills the round.
- Typing speed asymmetry: fast typists dominate the injection war.
- People may just take the earbud out; needs a soft rule, not code.

## Done means
Four players with earbuds sit in a measurably silent room for 60 s, each receives at least one TTS line only they can hear, a laugh from one player darkens exactly that player's plate on the TV within 300 ms while the other three stay lit, and the post-round transcript correctly attributes every line to its author and target.
