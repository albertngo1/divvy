## Overview
Lineup is a 3–5 player draft that deletes the single most tedious thing about drafting: the turns. You're each assembling a 3-piece supergroup from a shared pool of ridiculous musicians. Instead of passing picks around the table for ten minutes, everyone privately ranks the entire pool simultaneously, locks, and the server resolves a full snake draft in one instant — then plays it back slot-by-slot on the host TV like a live board. Everyone holds a secret objective, so the same drummer is worth different points to different people.

## Problem
Drafting is the best mechanic in tabletop and the slowest. Snake drafts mean sitting idle while five other people agonize, then re-planning when your target gets sniped one seat ahead of you. In person that's dead air; the fun (contention, sniping, hidden priorities) is buried under waiting. Private phones let all the agonizing happen in parallel, blind, and collapse into a single reveal.

## How it works
Host TV shows the shared pool of ~10 musicians (name, instrument, a silly trait) and an empty draft board. Each phone PRIVATELY shows: the same pool as a drag-to-rank list, plus a SECRET objective card — e.g. "you want a jazz trio," "avoid the diva at all costs," "maximize matching hair colors." Players rank all ~10 blind and lock. The server runs a deterministic snake draft over the locked rankings: seat order chosen randomly, round 1 forward, round 2 reversed, each player receiving their highest-ranked STILL-AVAILABLE musician per pick. Ties broken by a private hidden priority token each phone was dealt. The host then animates the board filling pick-by-pick — "Player 3 SNIPES the guitarist!" — and finally scores each lineup against its owner's secret objective, revealed at the end.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room { pool[], seatOrder[], phase }`, `Player { id, ranking[], objective, priorityToken }`. Because resolution is a single server computation from locked inputs, there is no real-time tick sync — the hard part is the resolver: a correct, deterministic snake pass that always assigns each player their best available choice, handles collisions and ties reproducibly, and never dead-locks or double-assigns. The reveal is a scripted client-side playback of the server's pick log, so all phones and the TV stay consistent from one broadcast.

## v1 scope
- 3 players, a 9-card fixed pool, each drafts exactly 3.
- One secret objective per player from a tiny deck.
- Blind simultaneous ranking → instant resolve → animated board + scores.

## Out of scope
- Multiple rounds, re-drafts, trades.
- Procedural pool generation; live turn-based mode.
- More than one objective type beyond the starter deck.

## Risks & unknowns
- Ranking all 10 blind may feel like homework if the pool is dull — traits must be funny and objectives punchy.
- Contention has to actually happen; if objectives rarely overlap, nobody gets sniped and the reveal is flat.

## Done means
Three phones submit full blind rankings, the server resolves a legal snake draft where every pick is each player's best available choice, and the host replays the board and reveals per-objective scores — with no player ever seeing another's ranking or objective before reveal.
