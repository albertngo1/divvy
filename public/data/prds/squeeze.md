## Overview
Squeeze is a simultaneous pick-and-pass drafting game for 3–5 players. Each phone privately holds your growing hand, your current pack, and a secret commodity you're trying to *corner*. It's for people who love the Sushi Go / 7 Wonders draft but hate the physical passing.

## Problem
Pick-and-pass drafting is elegant game theory and a logistical nightmare in person: everyone must pick in sync, hide their pick, physically hand a fan of cards left without flashing them, and nobody can remember what wheeled. Hidden hands + strict simultaneity + secret objectives are exactly what a shared table can't keep straight — and exactly what phones do perfectly.

## How it works
A deck of commodity cards (Oil, Grain, Copper, Steam). Each player is secretly assigned one commodity to corner. Everyone receives a private pack of 6 on their phone; simultaneously each taps one card to keep (it drops into their hidden tableau), and the server passes the diminished pack to the left. Repeat until packs empty. You're reading the draft — which commodities *stop appearing* tells you someone's hoarding — while hiding your own target. At the end the host reveals all tableaus and scores: points per card of your secret commodity, plus a big bonus for holding the majority of it ("the squeeze").

Private per-phone: your pack, your growing tableau, your secret target. Shared: the pass-left animation, a pick timer, and the final reveal. One phone passed around can't hold three hidden hands and three secrets at once — the per-phone privacy IS the game.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit DO per room / Socket.IO over Tailscale Serve). Data model: `Room{code, players[], deck, packs{playerId→Card[]}, direction, phase}`, `Player{id, name, tableau[], secret}`. The server deals packs and owns all state; each phone is pushed ONLY its own current pack, tableau, and secret. Sync is a PICK-phase barrier: the server waits for all players' picks (or a timer), then rotates packs atomically and pushes the next pack to each phone. The genuinely hard part is that barrier — everyone picks "at once," but stragglers/timeouts must auto-pick and the rotation must be atomic so no pack is seen twice or dropped; and secrets/tableaus must never cross the wire to another client.

## v1 scope
- 3 players, one round
- 4 commodity types, packs of 6, a single pass-left rotation
- One secret target each, 15s pick timer with auto-pick
- Host reveal + majority-bonus scoring

## Out of scope
- Reverse-direction rounds, card powers/combos, multiple rounds, reconnection, more commodities, spectators.

## Risks & unknowns
- With only 3 players and one pack, is signal-reading rich enough or does it feel arbitrary?
- Secret-objective drafting may be too heady for a loud party — might need a lighter comedic skin.
- Timer tuning: too short frustrates, too long kills tempo.

## Done means
Three phones join, each privately drafts from packs that rotate correctly (each pack shrinks by one and reaches the next player) with hidden tableaus, and the host reveals final hands and correctly awards the majority "squeeze" bonus — with no player ever seeing another's pack, tableau, or secret before reveal.
