## Overview

A 4-player, 4-minute deduction game for a TV and four phones. Four suspects, four rooms, eight private clues dealt two per phone. Six clues pin the true arrangement. The other two are held by one player and are true of a *second, fully consistent* arrangement — a parallel solution differing by one swap. That player is told nothing. For people who like Cluedo but find it slow and public.

## Problem

The usual imposter is caught by internal incoherence: their story wobbles. Here the imposter's world is airtight. Every clue they hold is internally consistent, individually compatible with any two clues anyone else says, and produces a clean, confident, wrong answer. The only way they're wrong is *relative to other people's information* — which makes the accusation feel less like catching a liar and more like discovering a fault line between two worlds.

## How it works

1. TV deals the case publicly: four named suspects, four rooms, the fact that exactly one player's file is from the wrong case. Nobody is told which.
2. Each **phone privately** shows two clues, e.g. "Bo was not in the Study" / "Whoever was in the Garage went in before Ada." Phones also hold a drag-to-solve board: four names into four rooms, editable all round, visible only to you.
3. Each phone has one **PUBLISH** button, usable once. Publishing puts that clue's exact text on the TV forever. Your other clue you may only paraphrase out loud — which is where information rots and where the imposter breathes.
4. Four minutes of open talk. The imposter's clues will start colliding with the room's combined picture, but never with any single statement — the contradiction only appears three clues deep.
5. Everyone privately submits a final assignment plus an accusation. Innocents score 2 for the true arrangement, 1 for a correct accusation. The odd player scores 3 if they submit *their* arrangement and dodge the plurality. TV reveals both worlds side by side, and the exact clue triple that separates them.

## Technical approach

Cloudflare Durable Object per room, phone PWA clients, host tab subscribes read-only.

Case generation: enumerate all 4! = 24 assignments. Each clue template compiles to a 24-bit satisfaction mask. Pick truth T and alt T' (one transposition apart). Sample six clues whose mask AND equals exactly `{T}`; sample two whose mask contains T' and excludes T, with the constraint that each is jointly satisfiable with every *pair* of innocent clues — so no two-clue gotcha exists and contradictions surface only at three. Rejection sampling over bitmasks; sub-millisecond.

State: `{case, clues[8] with ownerId, published: clueId[], boards: Map<playerId, assignment>, stage}`. Clue text is delivered only to its owner until published; the DO is the sole holder of the full deal.

Hard part is not sync — it's generation quality. The constraint stack (unique T from six, T' reachable, no shallow contradiction, and clue text that reads like a party game rather than an LSAT section) is what makes or breaks it, and it needs an offline validator that brute-forces every generated case before it ships to a room.

## v1 scope

- Exactly 4 players, 4 suspects, 4 rooms, 8 clues, one round.
- One clue template family: "X was/wasn't in ROOM" plus "ROOM person entered before/after X."
- One PUBLISH per phone, one 4-minute timer, one blind submit.
- Side-by-side two-world reveal on the TV.

## Out of scope

Multiple rounds, 5+ players, scoring history, richer clue types (counts, adjacency), hints, spectators, reconnect mid-round.

## Risks & unknowns

- May read as homework. If the room goes quiet and heads-down, the design has failed; the PUBLISH economy and the paraphrase rule are the only things forcing talk.
- The odd player may realise instantly and simply stay silent, which is boring for them. Countermeasure being tested: their score requires submitting T', which requires hearing enough of other people's clues to complete a world they only half hold.
- Four minutes may be too short for anyone to reach the three-clue collision.

## Done means

Generator passes a validator on 500 consecutive cases (unique T, valid T', zero two-clue contradictions). In live play with four phones, the room reaches a majority accusation before the timer in at least two of three sessions, and at least one session produces a player who realised mid-round their file was the wrong one and quietly played for it.
