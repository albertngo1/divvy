## Overview
Nerve is a phone-native riff on *The Mind* (the wordless co-op card game) with a hidden-saboteur twist. Four to five friends try to play all their numbered cards in one global ascending sequence — across the whole room, with zero talking — while one secret player is quietly trying to make it fail without getting fingered. It's for groups who love white-knuckle tension and a dash of paranoia.

## Problem
*The Mind* is sublime but fragile: it needs physical cards, an honor-system of total silence you can't police, and after a few plays the pure co-op can flatten. A shared/passed phone would instantly leak hands and kill it. The itch: keep the breath-holding timing game, make silence and hidden hands structurally enforced, and inject a reason to distrust the person next to you.

## How it works
Each phone PRIVATELY shows only your own hand (e.g. three numbers 1–100, sorted) and one big **PLAY LOWEST** button. The shared TV shows only the top of the stack (last number played), lives remaining, and a pulsing tension bar — never anyone's cards. The room must tap out cards in ascending order by pure feel: hold a low number and you tap soon; hold a high one, you sweat and wait.

When someone plays, the server checks it against the true global minimum of all unplayed cards. If a smaller card existed elsewhere, that card is **burned** and the room loses a life; the TV flashes *whose* card got skipped (not its value). One player's phone PRIVATELY marks them the **Saboteur**, with a hidden goal: force N burns while never being the majority suspect. Their misplays look like honest timing misreads. After each burn, every phone PRIVATELY casts a one-tap suspicion vote (or pass). Innocents win by surviving; even on a loss, catching the saboteur is a consolation win.

PRIVATE per phone: your hand, your role, your votes. SHARED: stack top, lives, who got burned.

## Technical approach
Host browser tab + phone PWAs + authoritative WS server (PartyKit/Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Model: `Room{players[], stack[], lives, saboteurId, votes}`, `Player{id, hand[], role}`. Server holds the true global-min of unplayed cards and adjudicates every play; it broadcasts a redacted state to the TV and role-appropriate private state to each phone — no client ever receives another player's hand. Hard part: **near-simultaneous PLAY taps**. The single-threaded DO serializes an ordered event queue and resolves burns deterministically, with latency-normalization so a laggy phone isn't unfairly ruled "late."

## v1 scope
- 4 players, one round, one deck of 12 cards (3 each)
- One life threshold, one saboteur, one suspicion vote after a burn
- Text/number only, room-code join, no reconnection

## Out of scope
- Levels/escalating difficulty, star & shuriken powers
- Multiple saboteurs, reconnection, spectators, sound

## Risks & unknowns
- Latency fairness for simultaneous taps
- Saboteur may be too obvious at 4 players; burn-threshold balance
- Whether a single round delivers enough tension

## Done means
Four phones join by code; each sees only its own 3 cards; the room can silently empty the stack in order; an out-of-order play burns a life shown on TV; a suspicion vote resolves; and the network inspector confirms no client ever receives another player's hand.
