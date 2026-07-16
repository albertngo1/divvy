## Overview
Vig is a second-screen betting game for 3–6 people watching short suspense clips on a TV. It turns passive "ooh, what happens next" viewing into a live parimutuel betting floor where the smart money and the crowd fight over a shared pool.

## Problem
Everyone already shouts predictions at the screen ("no way he lands it") — but there are no stakes, no memory, and no payoff for being the one contrarian who called the upset. The best moment in passive watching, the pause before the reveal, is wasted.

## How it works
The host plays a 15–40s clip that stops on a cliff — a trick-shot mid-air, a soufflé in the oven, a gameshow wheel slowing. The host screen shows 2–4 labeled outcomes plus a live pool/odds bar. During a 10s lock window each phone privately drags chips onto outcomes; nobody sees anyone else's stake, and the host shows only the aggregate pool as odds shift. Once locked, the clip resumes and resolves. Losing chips split among winners in proportion to stake — so backing the chalk pays pennies, and a lone player who nails the longshot triples up.

The private twist: once per game each phone is dealt one TRUE insider tip about a future clip's outcome, shown only to that player. Sometimes your hidden bet is backed by real asymmetric info, and the room can't tell whether your fat stake is a bluff, a read, or a tip. Passing one phone around would destroy both the blind-odds market and the secret tips — the privacy IS the game.

Host TV = clip + outcomes + aggregate odds + chip-total leaderboard. Phone (private) = your chip stack, your secret stake allocation, your insider tip.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{clips[], phase, pool{outcomeId→total}}, Player{id, chips, secretTip?, pendingStake{outcomeId→amt}}. Clips are pre-authored JSON with a marked pause timestamp and resolved outcome. The server is the clock: it broadcasts phase transitions (BETTING_OPEN, LOCKED, RESOLVED) and the aggregate pool on each stake delta, but never individual stakes until RESOLVED. Hard part: fair lock timing — stakes are accepted only inside the window with server timestamps, and host playback must be driven by server phase events (not local video time) so nobody bets after glimpsing the outcome.

## v1 scope
- 3 players, one 4-clip round
- 3 hand-curated clips + outcomes
- Flat 20-chip stacks, single parimutuel pool per clip
- One insider tip dealt to one player total
- Host odds bar + final payout table

## Out of scope
- User-uploaded clips, automatic outcome detection
- Multi-round bankrolls, side bets, cross-game leaderboards

## Risks & unknowns
- Clip curation is the content bottleneck; outcomes must be genuinely uncertain
- Parimutuel math feels thin with 3 players — may need a house-seeded pool
- Lock-timing exploits if any client can peek ahead

## Done means
Three phones place blind stakes on a paused clip; the host resolves it and correctly splits the losing pool to winners by stake proportion, with one player having secretly received a true tip — all without any phone seeing another's bet before reveal.
