## Overview
Cold Read is a 3-4 player cooperative party game for a couch full of people who like the frantic charm of a live newsroom. The shared host screen is the broadcast ("ON AIR", one glowing mic indicator, a chyron that assembles as you go). Each phone is a newsreader holding one fragment of a bulletin and a private clue about where that fragment belongs in the running order. The room has to reconstruct the correct sequence purely by talking — while obeying the ironclad rule that only one mic is ever open.

## Problem
Sequencing games usually let everyone see the pieces and silently sort them. That kills the table talk. Cold Read hides each piece on its owner's phone and adds a single-lane mic so the fun becomes: negotiate the order out loud, then perform the broadcast cleanly without talking over each other.

## How it works
**Private on each phone:** your headline fragment (e.g. "...witnesses report the smell of smoke near the pier..."), and one ordering constraint that only references *content* nobody else can see ("You go IMMEDIATELY AFTER the fragment that mentions a FIRE"). A big hold-to-talk GO LIVE button.

**Shared host screen:** the ON AIR banner, a single mic-status light (green = one live, red = collision), and the chyron that appends each fragment in the order it was actually broadcast.

**Flow:** Because you can only satisfy "go after the FIRE fragment" if you know who holds it, players must read their fragments aloud during a prep phase. Then they broadcast: whoever believes they're first holds GO LIVE and reads. Two GO LIVEs open within ~250ms → DEAD AIR: static plays, both are bumped, small penalty. When all fragments are broadcast once, the server compares the tap-order against the hidden canonical order. One clean, correctly-ordered pass = win.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `room{fragments[], canonicalOrder[], liveMicOwner, broadcastLog[]}`, `player{fragmentId, constraintText, micState}`. Sync: GO LIVE press sends a timestamped `claimMic`; server grants to the first arrival and rejects others, echoing `micState` to all. **Genuinely hard part:** fair single-mic arbitration under variable phone latency — the server normalizes client press-timestamps against per-client RTT (measured via periodic ping) so a laggy phone isn't unfairly bumped, and defines the collision window server-side. No speech recognition needed; reading aloud is the information channel, scoring is order + overlaps.

## v1 scope
- One bulletin, 4 fragments, 3-4 players
- Single ordering constraint per phone
- Hold-to-talk single mic with collision detection
- Host chyron assembles in broadcast order; win/lose check at end

## Out of scope
- Speech-to-text verification of what's read
- Multiple rounds, scoring ladder, difficulty tiers
- Branching bulletins or per-player scoring

## Risks & unknowns
- Constraints must guarantee a unique solvable order — needs a small validated fragment-set generator
- 250ms collision window may feel harsh over cellular; tune against RTT
- Reading aloud could be skipped by clever players inferring order from constraints alone — keep constraints content-referential so speech stays load-bearing

## Done means
Four phones each show a distinct fragment + constraint; players talk out the order; a correctly-ordered single-mic broadcast lights the host chyron in full with zero DEAD AIR flags, and any out-of-order or overlapping run is rejected.
