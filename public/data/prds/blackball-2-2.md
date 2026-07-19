## Overview
Blackball is a 3-6 player concurrent-room party game about *negative* drafting. Instead of taking turns claiming things, players take turns secretly *removing* them from a shared shortlist — the way a real blackball urn worked, where members dropped hidden adverse balls to reject a candidate. It's for a group that wants a short, sharp bluffing round: 'which of these 6 survive, and can I hide who I'm protecting?'

## Problem
Veto/ban rounds (map-bans in esports, cut-that-topping negotiations, the actual blackball urn) are genuinely tedious and un-fun in person. Voting aloud is reactive — the last person to speak just counter-bans, killing suspense — and passing a physical urn is slow and leaks who did what. The whole point (anonymous, *simultaneous*, committed adverse votes) collapses without private simultaneous state.

## How it works
The host TV shows a pool of 6 candidate cards (movies, toppings, or abstract crests) and a round counter. **Privately, each phone shows:** one secret 'horse' — a candidate you score points for keeping alive to the end — and your dwindling stock of 3 blackballs.

Each round is simultaneous and blind: every phone secretly drops one blackball on a candidate (or passes to save it for later). When all phones have committed, the TV reveals the tallies at once; the most-blackballed candidate is eliminated (a tie eliminates none). You cannot see votes until everyone has locked in, so you can't counter-ban reactively — you must *predict* the pile-on and decide whether your horse needs protecting yet or whether spending now wastes a scarce ball. Rounds continue until 2 candidates remain. Score: your horse surviving = points; an optional guess phase awards a bonus for naming another player's horse.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object; Socket.IO over Tailscale Serve for local). Data model: `room{code, phase, round, pool[], eliminated[]}`, `player{id, secretHorse, ballsLeft}`, `votes: Map<playerId, candidateId|PASS>`. Sync is strict lock-step: the round stays hidden until every live player has submitted, then the server resolves the tally atomically and broadcasts one reveal frame. The genuinely hard part is the commit boundary — enforcing 'no vote visible until all in,' handling a player who never submits (per-round timeout auto-passes them), and deterministic tie resolution — all server-side so no client can peek early.

## v1 scope
- 3 players, 6 candidates, 3 blackballs each
- One game, eliminate down to 2 survivors
- Secret horse assigned at start; horse-survival scored on TV
- Per-round 20s timeout auto-passes

## Out of scope
- Guess-the-horse bonus phase, content packs, spectators, reconnection, multi-round matches, cosmetics.

## Risks & unknowns
- Kingmaking / gang-up degeneracy with only 3 players; scarce balls may not create enough tension.
- Is a hidden horse actually deducible from vote patterns, or is it noise? Needs playtest.
- Tie-heavy games could stall.

## Done means
Three phones join, each gets a distinct secret horse, three simultaneous blackball rounds resolve with votes hidden until all committed, elimination proceeds to 2 survivors, and the TV correctly scores whose horse lived.
