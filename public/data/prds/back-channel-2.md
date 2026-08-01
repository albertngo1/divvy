## Overview
A 90-second, 4–6 player trading floor for a living room. Every player holds a private hand of goods and a secret objective; every pair of players can be mid-negotiation simultaneously, privately, and bindingly. The shared TV publishes the *topology* of who is talking to whom — never the content. For groups who love Diplomacy's back-room dealing but not its serialized, hour-long "everyone please leave the room" ritual.

## Problem
Private negotiation is the best mechanic in tabletop and the most tedious to run. Hidden-hand trading games (Bohnanza, Sidereal Confluence, Chinatown) serialize: one deal at a time, audible to everyone, with a table of bored spectators. Truly secret deals require people to physically walk out. The result is that most groups never get the good version — parallel, deniable, binding.

## How it works
Each player is dealt 6 goods tiles across 4 types and one secret objective ("end holding the most Cobalt", "end holding zero Salt"). A single 90-second clock runs. There are no turns.

**Private, on your phone:** your hand; your objective; a live list of open offers to and from every other player. An offer is two taps — pick what you give, pick what you want — plus an optional 24-character note. Both sides tap ACCEPT and the swap executes instantly and irrevocably. You can hold five conversations at once.

**Public, on the TV:** a ring of player names with glowing wires between any pair with a live offer on the table, brightening with traffic. Also each player's completed-deal count and a per-player "goods held" total (count only, never types). So the room can see that you and Priya have been wired together for forty straight seconds while you're loudly promising Marco your last Cobalt.

That gap is the game: you negotiate out loud, across the room, and execute silently with your thumb. Each player also holds one **LEAK** — spend it and one full conversation, notes included, is published to the TV forever.

## Technical approach
Host browser tab + phone PWAs + one Cloudflare Durable Object per room (authoritative, single-threaded). Model: `Player{id, hand: Map<goodType,int>, objective, leakUsed}`, `Offer{id, a, b, give, want, aAccepted, bAccepted, version, state}`. Phones send intents only; the DO validates against current hands, mutates, and broadcasts two different payloads — a redacted public frame to the host, full private frames per socket.

The genuinely hard part is **offer coherence under concurrency**: the same Cobalt tile can be promised in four live offers, and the instant one executes the other three are invalid. The DO's serial execution gives a total order for free, but the UX doesn't — phones run optimistic accepts and must roll back gracefully ("that tile is gone") without feeling broken. Fairness on simultaneous accepts uses server receive-order only; client clocks are ignored. Reconnect replays private state by session token.

## v1 scope
- One 90-second round, 4 players, 4 goods types, 6 tiles each
- Structured offers only (give/want/note), no counter-offer threading
- One LEAK per player
- One objective type: "hold the most X"
- Host screen: wires, deal counts, timer, final reveal

## Out of scope
Multi-round campaigns, free chat, promises/contracts that span rounds, reputation scoring, spectators, more than 6 players.

## Risks & unknowns
Heads-down silence is the failure mode — if phones absorb the negotiation, the party dies. Mitigation: offers are 2 taps, the note is length-capped, and the wire display gives the room a reason to look up and accuse. Unknown: whether 90 seconds is too frantic to lie in, or exactly right.

## Done means
Four phones on a LAN complete a round where at least one player executes a trade that contradicts something they said out loud, a LEAK publishes to the TV, and no swap ever leaves the total tile count off by one.
