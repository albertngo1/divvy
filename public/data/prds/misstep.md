## Overview
Misstep is an embodied hidden-role game for 4-6 players. Every phone privately shows the *same* five-step choreography card (CLAP, SPIN, POINT-UP, STOMP, WAVE). The room performs it together, in unison, on the host screen's countdown. But one player — the imposter — was dealt a card with a single step swapped (STOMP → CLAP on beat 4). They don't know. When the whole room moves as one, the imposter is physically, visibly off on exactly one beat — and the deduction is spotting *when* it happened and *who* did it, live, in a half-second.

## Problem
Hidden-role deduction is almost always verbal or on-screen. Misstep moves the tell into the physical room: your body executes your private view, and the divergence is a flash of motion, not a sentence. It's load-bearing per-phone because each player must be reading their *own* secret routine at that instant — a single shared phone can't drive five people dancing simultaneously.

## How it works
**Study phase (20s):** each phone privately displays its five-move sequence as big icons; players memorize it. Phones then blank out so nobody can peek mid-performance.

**Perform phase:** the host TV runs a synchronized metronome — "5, 4, 3, 2, 1" then five numbered beats, ~1.2s apart, each beat showing only the beat *number* (never the move). On each beat every player performs their memorized move from memory. The imposter, faithfully recalling their (differently-dealt) card, does the wrong move on one beat.

**Accuse phase:** the TV replays the beat count. Each phone privately answers two questions: **which beat** looked off, and **who** did it. Correct majority on *both* the beat and the person = group wins; imposter survives a scattered vote = imposter wins. Reveal shows both cards side by side with the swapped step highlighted.

A twist: because it's from *memory*, honest players also fumble — so the group must separate "someone flubbed" from "someone was systematically doing a different move," which is the real read.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve, or PartyKit). Data model: `Room{ beatClock, phase }`, `Player{ id, routine[5], isImposter, guessBeat, guessWho }`. Server deals a base 5-move routine to all, then clones it for the imposter with exactly one index mutated to a *distinct* move.

Sync strategy: the metronome is server-driven with a broadcast `beatStartAt` timestamp; phones and TV align to it (accepting ~50-100ms clock skew, fine since humans are the imprecise element). No per-beat input is captured during performance — the game trusts human observation, which sidesteps the hard problem of sensing dance moves. The genuinely hard part is **making the divergence legible but not trivial**: the swapped move must be visually distinct from its neighbor (don't swap CLAP→WAVE, too similar) and the group is small enough that one off-beat body is catchable — a curated move set with a "visual distance" matrix guarantees the swap is spottable.

## v1 scope
- 4 players, one round, one 5-move routine
- Fixed move vocabulary of 6 icons; one hand-picked swap
- Metronome sync + two-part accuse vote + card-overlay reveal

## Out of scope
- Any motion sensing / accelerometer verification of moves
- Multiple rounds, longer routines, two imposters
- Audio music track (metronome tick only for v1)

## Risks & unknowns
- Honest memory flubs drowning the signal (mitigated: it *is* part of the fun; tune routine length)
- Clock skew making the metronome feel ragged across phones + TV
- Everyone stares at their own body instead of the room (needs a "perform facing others" instruction)

## Done means
4 players memorize a shared five-move card, one player's card has a single swap, they perform on the synced metronome, and the group's beat+person vote correctly fingers the imposter more often than chance.
