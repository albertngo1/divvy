## Overview
Handshake is a wordless, phone-per-player party game about silent mutual selection. On a shared host screen the room sees only how many players remain unpaired. On each private phone, you secretly pick the ONE other person you want to pair with. A bond forms only when two players choose each other simultaneously. The group wins when everyone is paired — the emergent challenge of converging on a stable matching using nothing but eye contact and nerve. Built for 4–8 players who like the read-the-room tension of Wavelength without the guessing-a-number part.

## Problem
Most 'match each other' games funnel through a single reveal — everyone answers, then you compare. There's no live loop of adjustment, and one phone passed around would work fine. Handshake makes the *negotiation itself* the game: you commit privately, watch what locks and what doesn't, and re-aim. The itch is the silent stand-off where two people both want the same third person.

## How it works
Each round the host screen displays the roster of player avatars and a big 'UNPAIRED: N' counter. Every phone PRIVATELY shows the same roster as tappable faces and a single live selection — 'I choose ___'. You may change your pick freely and continuously; nothing is shown to anyone else. The authoritative server continuously checks for mutual edges: if A is currently choosing B and B is currently choosing A, that pair LOCKS (both phones buzz, both avatars gray out on the host screen, counter drops). Locked players are removed from everyone's selectable roster, forcing the rest to re-converge. With an odd count, one 'odd one out' seat is fine — the target is UNPAIRED ≤ 1. A 90-second timer and a shared soft heartbeat (that speeds up as time runs low) apply pressure. The fun is the flicker of near-misses: you feel someone glance at you, you both swap picks, and it clicks.

## Technical approach
Host tab + phone PWAs + one authoritative WebSocket room (PartyKit / Cloudflare Durable Object over Tailscale Serve). Data model: `room {players[], phase, deadline}`, `player {id, name, pickId|null, lockedWith|null}`. Sync: each phone sends `{setPick: targetId}` on every tap (debounced ~50ms). The Durable Object holds the only truth; on each pick change it recomputes mutual edges and greedily locks any new mutual pair, then broadcasts ONLY `{unpaired, lockedAvatarIds}` to everyone and a private `{yourPickId, youLocked}` to the actor. The genuinely hard part is race resolution: if A→B and B→A arrive within milliseconds while C is also chasing B, the server must lock deterministically (lowest-id-first, single-threaded DO event loop) so no player ends up double-locked or ghost-paired.

## v1 scope
- One round, 4 players, target UNPAIRED = 0 (two clean pairs)
- Tap-to-pick roster on phone, live mutual-lock detection server-side
- Host screen shows only the unpaired counter + grayed avatars
- 90s timer, win/lose splash

## Out of scope
- Odd-player 'wallflower' seat, 6–8 players
- Multi-round scoring, streaks, or roles
- Any chat, emotes, or hint system
- Reconnect/rejoin mid-round

## Risks & unknowns
- Might resolve too fast (instant obvious pairs) — may need to hide the roster briefly or add a 'no repeat partner' constraint across mini-rounds.
- Griefer who never commits stalls the room; needs a gentle 'idle' nudge.
- Whether 'mutual' is legible enough without a talk channel for 6+.

## Done means
Four phones join one host room; each privately selects a target; when two select each other the server locks them within 200ms, both phones buzz, the host counter decrements, and reaching UNPAIRED = 0 shows a win splash — verified with a deliberate three-way contested pick that resolves to exactly two pairs with no double-lock.
