## Overview

Muster Point is a 90-second cooperative rendezvous game for exactly three people in a room with a TV. The host screen shows a blank arena and three identical white dots. Each player's phone shows nothing but a black trackpad. You do not know which dot is yours, your drag direction has been secretly rotated, and nobody may speak. You win when all three dots sit inside a 60px circle for two continuous seconds — at a point nobody was allowed to name.

## Problem

Most "secretly match each other" games converge on an *answer* — a word, a pitch, a pattern. The negotiation is over content. Nobody has built one where the negotiation is over *space and identity*: figuring out which body on screen is yours while three people are all wiggling at once, then discovering your own control mapping, then proposing a destination using only motion. Silence isn't a rule you obey here; it's the medium you're forced to write in.

## How it works

**Host screen (public):** a featureless arena and three identical, unlabeled, indistinguishable dots. A dot that stops moving for two seconds fades to 20% opacity and stops counting toward the win — you cannot park and force the others to come to you. A thin ring appears when the three dots are within ~2× the win radius, so the endgame is legible.

**Phone (private):** a full-screen drag pad, a countdown, and nothing else. No dot, no coordinates, no map. Crucially, each phone is assigned a secret transform from {0°, 90°, 180°, 270°} plus, for exactly one random player, a horizontal mirror. Your "up" may be someone else's "left."

So the round has three silent phases nobody is told about: *find yourself* (twitch and watch), *calibrate* (learn your rotation), *rendezvous* (propose a meeting spot by orbiting it, or follow someone who clearly has). The gorgeous failure mode is two players confidently converging while the third is still hunting for their own dot.

## Technical approach

Host browser tab + phone PWAs + one authoritative PartyKit/Durable Object room.

- **Model:** `Room { phase, tEnd, players: [{id, pos:{x,y}, vel, transform, lastMovedAt}] }`. Transform is server-side only and never leaves the server.
- **Input:** phones send `{dx, dy}` normalized drag deltas at 30Hz over WebSocket. Phones render nothing and receive no position data — this is deliberate, it forces every eye onto the TV.
- **Tick:** server integrates at 30Hz, applies each player's secret rotation matrix, clamps to arena, computes fade state and the win condition (max pairwise distance < R held 2s), and broadcasts the full state **to the host only**.
- **Hard part:** preserving ambiguity under latency. Dots must be visually identical, spawn-shuffled, and equally laggy — if one player's 80ms link makes their dot visibly crisper than a 160ms link, self-identification becomes trivial for them and impossible for the others. Fix: buffer all input to a common 150ms delay horizon so every dot lags equally, and interpolate on the host at 60fps between 30Hz ticks.

## v1 scope

- Exactly 3 players, one 90-second round, one arena.
- Four rotations + one mirror. No difficulty tiers.
- Win/lose screen that finally reveals which dot was whose and each player's secret transform.
- Four-letter room code, no accounts, no persistence.

## Out of scope

More than 3 players, obstacles, scoring across rounds, audio, haptics, spectators, reconnect recovery.

## Risks & unknowns

The mirrored player may be so disoriented the round is unwinnable — tune by testing whether mirror should be dropped in v1. Equal-latency buffering may feel mushy. Three unlabeled dots may be genuinely unreadable on a small TV at distance.

## Done means

Three phones join by code, each gets a different secret transform, all three dots move independently on the TV, no phone ever receives position data, and a room of three strangers wins at least once in five attempts without speaking.
