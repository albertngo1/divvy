## Overview

A 4-player, one-round hidden-role game. Everyone plays a fast, dumb, wordless tapping round — five ticks, three buttons — then testifies about what they did. Three players testify from memory. One player testifies from a **written record of their own actions that has been quietly altered**. The imposter is the only person in the room holding hard evidence, and it is fake. Their choice is the whole game: trust the paper, or trust the fading feeling that they pressed something else.

## Problem

The genre keeps corrupting the imposter's view of *the world* — a map, a photo, a set of minutes, someone else's lines. Nobody corrupts their view of *themselves*. That's the only version where the imposter has independent counter-evidence sitting in their own head, which turns the round from "perform confidence" into a real, sweaty epistemics problem. It also solves the usual imposter problem — that bluffing is a skill and bad bluffers hate playing — because the honest move and the deceptive move both feel awful.

## How it works

**Phase 1 — Ticks (35 seconds).** The TV counts down five 5-second ticks. On each tick every phone shows three big unlabeled shapes — CIRCLE, WEDGE, BAR. You tap one. That is all. The pace is fast enough that you don't rehearse.

**TV during ticks (public):** for each tick, only the **modal shape** — the one the most people tapped — appears, as a silhouette. Ties show both. Counts are never shown, and neither is anyone's identity. So the room ends with five public facts that constrain, but do not determine, the sixteen private taps.

**Phase 2 — The Record.** Each phone privately displays your five taps as a clean row of icons, captioned "YOUR ROUND." For three players it is accurate. For one, the server rewrote **exactly two of the five**. There is no indication which, or that anything was touched.

**Phase 3 — Testimony (3 minutes).** The room talks. Everyone reads their row aloud, in any order they like, arguing over whether the four rows are consistent with the five public modals. They usually aren't quite, because honest players misread and misspeak and the modals are weak constraints — that noise is deliberate.

**Phase 4 — Vote.** Everyone privately names the player whose record was doctored. Room wins on a majority hit; the doctored player wins by surviving.

## Technical approach

Socket.IO over Tailscale Serve, or a PartyKit Durable Object — one room object holding `{ players[4], ticks[5], taps: {playerId → shapeId[5]}, doctoredPlayerId, doctoredIndices[2], phase, votes }`. Taps are the only real-time surface and they're tiny: one message per player per tick, server-timestamped, with a hard cutoff at tick boundary. A missed tap is recorded as a deliberate NONE and shown as such — no silent defaults, or the doctoring becomes indistinguishable from lag.

The genuinely hard part is **choosing the doctoring**. A random rewrite frequently produces a row that flatly violates the public modals (five people can't all have tapped WEDGE if the modal was BAR with four players), which convicts instantly. The server must search rewrites subject to: the altered row stays consistent with every published modal, and at least one honest player's true row is *also* inconsistent-looking under some plausible reading. With 4 players × 5 ticks × 3 shapes the space is small enough to brute-force in under a millisecond. That constraint solver is the product.

Second hard part: clock skew. Phones must agree on tick boundaries within ~150ms, so the server broadcasts tick start with an NTP-style offset handshake at join and phones render locally against the corrected clock rather than waiting on a message.

## v1 scope

- 4 players, one round, five ticks, three shapes
- One doctored record, two altered cells, chosen by the constraint solver
- TV shows modals only; no counts, ever
- Single 3-minute talk timer, one vote, one reveal
- Room code join, no accounts

## Out of scope

- Multiple rounds, scoring, 5+ players
- Any phone-to-phone messaging
- Replay of the true tap history (reveal shows it, nothing else does)
- Difficulty tuning knobs

## Risks & unknowns

- **Memory may be too weak.** If nobody remembers their own five taps, the doctored player has nothing to notice and the round is a coin flip. Five ticks at 5 seconds is a guess; may need four ticks, or shapes with a physical hook (position on screen).
- **Modals may be too weak a constraint** with four players — expect ties on most ticks, which could make testimony unfalsifiable.
- The doctored player figuring it out in ten seconds and calmly lying is the *good* outcome, but it's also the outcome where the round is over early.

## Done means

Four phones join, tick together within 150ms, and record 20 taps server-side. Exactly one phone shows a two-cell-altered row that the solver has verified is consistent with every published modal. Three minutes of testimony followed by a vote and a reveal screen that lays all four true rows beside all four shown rows. In playtest, the doctored player says out loud "I did not press that" in at least half of rounds.
