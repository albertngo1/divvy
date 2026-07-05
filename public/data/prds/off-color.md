## Overview
Off-Color is a silent, blind game of distributed graph coloring dressed up as a party standoff. 4–5 players sit in a fixed ring; each must land on a color different from their two neighbors — but nobody talks, and no one sees anyone's choice until the simultaneous reveal. For friends who like a tense, cerebral puzzle hiding inside a party game.

## Problem
Most party games want the table to sync up. Off-Color punishes matching: if you and a neighbor pick the same color, you both clash and lose. Coordination is the trap — you have to out-think the person beside you while they're out-thinking you, blind, on a timer. The failure mode is agreement.

## How it works
The host shows a ring of player avatars with edges drawn between neighbors. Each round (a few seconds, timed) every phone PRIVATELY shows 3 color buttons; you pick one. Your phone shows only YOUR seat and the NAMES of your two neighbors — never their picks. On reveal the host colors every avatar at once; each edge whose endpoints share a color flashes red = a clash. Clashing players lose a point (or the room's shared 'harmony' meter drops — a tuning choice); cleanly-colored players score. Then private feedback lands on each phone: 'you matched Priya on your left.' Next round you adjust — but so does Priya, and so does her other neighbor, cascading around the ring. With 3 colors a perfect coloring exists, but reaching it blind is the whole puzzle. Best-of-3 rounds; most clean edges wins, or race to a fully clean ring.

Per-phone is load-bearing: every player has a private, simultaneous color choice plus private neighbor-only feedback. Passing a single phone around would destroy the simultaneity and the hidden intent that make it a standoff.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, ringOrder:[playerId], round, picks:{playerId→color}}; each Player knows only its neighbor ids. Sync: roundStart → server sends each phone its neighbors' names privately; phones send pick(color); server waits for all picks or the timer; computes clashes over ring edges; broadcasts a public reveal to the host plus a private clash report per player. The genuinely hard part is simultaneity and honesty: picks must be committed and hidden until every player is in (the server buffers and never echoes a pick to anyone before reveal), the timer must auto-lock a straggler's choice, and ring order must stay stable across rounds so neighbor-learning actually matters.

## v1 scope
- One ring of 4 players, fixed order.
- 3 colors, 3 timed rounds (~6s each).
- Host reveal with red clash-edges; private 'which side clashed' per phone.
- Score = clean edges; winner screen.

## Out of scope
- Larger or irregular graphs, more colors, variable topology, teams, animation beyond the flash.

## Risks & unknowns
- May feel too quiet/puzzly for a party — needs a snappy reveal and an audio sting on clash.
- A 4-ring may be solvable in two rounds; might need 5 players or a nastier graph.
- Balancing individual vs shared scoring.

## Done means
Four phones join and sit in a fixed ring; each round they privately pick 1 of 3 colors under a timer; the host reveals all colors at once and flashes clashing edges; phones report which neighbor they matched; after 3 rounds a winner is shown. One full ring playable end-to-end.
