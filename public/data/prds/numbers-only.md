## Overview

A four-player talking game for a living room with a TV and four phones. Everyone holds what looks like the same ranked list — eight items, best to worst — and argues about it out loud. One player's list has two near-neighbours swapped. Nobody is told they are the odd one. The round ends with a double accusation: *who* is out of sync, and *where* the swap is.

## Problem

Hidden-role games usually hand the imposter an obvious hole ("you don't know the word") and the game becomes a bluffing exercise. That is a different, thinner game than paranoia. The itch here is: what if the odd view is so plausible that even its holder believes they're clean, and disagreement is indistinguishable from taste?

## How it works

**Host screen (public):** the round prompt ("Guest list, best to worst"), a running **claim log** of every formal statement made, a turn indicator, and the timer. It never shows item text tied to a number.

**Each phone (private):** an eight-row ladder, numbered 1–8, with the item text. Three phones are identical. The Desync's phone has positions 2/3 and 4/5 transposed — chosen so both swaps sit between genuinely arguable near-equals.

Three speaking rounds. On your turn you tap two numbers and a relation chip — *"6 over 3"*, *"4 and 5 are twins"*, *"cut 7"* — which posts to the TV log, then you defend it out loud. **Rule: you may never say an item's text.** Every phone has a FOUL button; two fouls void your claim.

The Desync's claims read as bad taste, not error. Only when the log accumulates does a contradiction cycle appear (A says 4 over 5, everyone else's claims imply the reverse).

Endgame: every phone privately submits (a) the suspected Desync and (b) the swapped pair. 2 points for the person, 3 for the pair. The Desync scores 4 if a majority misses them — and can score for the swap too, if they've worked out it was theirs.

## Technical approach

PartyKit / Durable Object per room; host tab and phone PWAs over WebSocket. State: `{ phase, players[], ladderId, canonicalOrder[8], perPlayerOrder{}, claims[], fouls[], votes{} }`. A phone is only ever sent its own permuted ladder — the canonical order never leaves the server, so a devtools-open player learns nothing.

Traffic is low-rate and turn-based, so sync is easy. The genuinely hard part is **content and reveal**: authoring ladders where two adjacent swaps are honestly arguable, and computing the reveal — run a minimum feedback arc set over the claimed comparison graph so the host can highlight the exact cycle that betrayed the Desync. Without that, the reveal is a shrug.

## v1 scope

- Exactly 4 players, one round, one hand-written ladder.
- Two fixed transpositions, always adjacent.
- Three claim types only; text foul is a button, not enforcement.
- Reveal shows the two ladders side by side plus the cycle.

## Out of scope

Multiple rounds, scoring across games, more than one Desync, ladder generation, spectators, reconnect.

## Risks & unknowns

Swaps may be too subtle (round is pure noise) or too loud (instant catch) — needs playtest tuning of item similarity. Players may leak text by describing items; the foul button may not be enough. Four honest players who all hedge produce a boring log.

## Done means

Four phones join by code, each shows a ladder, one is silently permuted; three claim rounds post to the TV log; all four vote; the reveal displays both ladders and the contradiction cycle, and scores are correct for both the who and the where.
