## Overview

A 3-player cooperative deduction game riffing on *Similo*, for a living room with a TV and phones. Twelve illustrated character cards sit face-up on the shared screen. Two **Witnesses** each privately hold a *different* suspect from that same lineup. One **Sketch Artist** must name both suspects. Neither witness knows the other's suspect — so every card you rule out could be the one your partner is trying to protect.

## Problem

Similo is a lovely 10-minute game that dies on a phone as a single-clue-giver app: pass the tablet, point at cards, done. The itch is that its one hidden card is a *thin* secret. Two simultaneous, mutually-blind secrets over one shared board turns a gentle clue game into a knife-edge coordination problem — and that only works if the two witnesses genuinely cannot see each other's screen.

## How it works

**Host TV (public):** the 12-card lineup, a witness-color legend, a pass counter (3 passes), and a running verdict log.

**Witness phone (private):** the same 12 cards, with *your* suspect ringed in gold — invisible everywhere else. Each pass you tap one live card and choose **SIMILAR** (shares something with my suspect) or **DIFFERENT** (discards it). You may never mark your own suspect DIFFERENT; the app greys that option out. Both witnesses submit *simultaneously* under a 45s timer, blind to each other.

**Reveal:** the server unlocks both verdicts atomically on the TV. When both witnesses touched the same card with *opposite* verdicts, it's highlighted — that contradiction is the richest signal the Artist gets. DIFFERENT cards are then discarded. If a discard removes the *other* witness's suspect, the TV flashes an ambiguous red **"A SUSPECT WALKED OUT"** — it never says which. The Artist learns something; the witnesses learn to panic.

**Artist phone (private):** a notes surface and, after pass 3, a locked simultaneous submission naming two cards. Score 2 / 1 / 0.

## Technical approach

PartyKit Durable Object per room; host tab and phone PWAs over WebSocket. State: `{ phase, board[12]{id,art,status}, targets{A,B}, passIndex, submissions{pid:{cardId,verdict}}, log[] }`. `targets` lives only in the DO — it is never in any broadcast payload.

Sync is **per-connection redaction**: one mutation fans out three different serializations (witness A sees `myTarget`, witness B sees theirs, artist sees none), and reconnect snapshots go through the same redactor so a refresh can't leak. The genuinely hard part is the atomic reveal: submissions must be buffered server-side and released in one frame, with a deterministic discard resolution when both witnesses hit the same card, and a timer that auto-submits a no-op for a dropped phone rather than stalling the room.

## v1 scope

- Exactly 3 players, one round, three passes
- One hard-coded 12-card lineup (public-domain character art)
- Two verdicts only: SIMILAR / DIFFERENT
- Text score screen, no persistence, no lobby beyond a 4-letter room code

## Out of scope

Multiple rounds, more than 2 witnesses, dual artists splitting the suspects, card packs, animation polish, rejoin-as-different-role.

## Risks & unknowns

Three passes may be too few to find two suspects — tune pass count in playtest. Contradictions might read as noise rather than signal without clear TV highlighting. The "suspect walked out" alarm could feel punishing instead of thrilling.

## Done means

Three phones join a code, each witness sees a gold ring the others provably cannot, three simultaneous pass cycles resolve with atomic reveals and correct discards, and the artist's locked pair scores 0–2 on the TV — with a mid-round phone refresh recovering the correct private view and leaking nothing.
