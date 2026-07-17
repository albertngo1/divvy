## Overview
Turnout is a 3–5 player anti-coordination party game about a group deciding where to go out tonight. It runs on a shared host screen (the city map of bars) plus each player's phone as a private nightlife concierge feeding them a personal, unreliable rumor. The fun is the sweat of acting on a hot tip while suspecting everyone else got the same tip.

## Problem
Most "pick a spot" party mechanics reward matching (Family Feud, majority vote). The itch here is the opposite social truth everyone knows: the place your whole friend group heard was great tonight is exactly the place that's now a 40-minute line. Turnout weaponizes correlated hype into a punishment.

## How it works
The host TV shows 3–4 venues (Neon, The Cellar, Rooftop) with hidden capacities and a shared payout pool. Each round, every phone PRIVATELY receives one short rumor tied to a venue — "Neon's got a live band," "Cellar's dead tonight," "heard Rooftop has no cover." Rumors are noisy and asymmetric: some are true, some are planted, and crucially, several players may have been fed rumors pointing at the SAME venue without knowing it.

Each phone shows ONLY its own rumor plus three venue buttons. Everyone commits simultaneously and blind. The host then reveals turnout per venue. Scoring is a minority/crowding rule: a venue's payout is split among everyone who chose it, and if a venue draws MORE than its hidden capacity (e.g. 2), it's overcrowded — everyone there gets bounced and scores zero. The lone player at a good-but-quiet bar cleans up. The room's collective goal is to spread across venues; converging on the "obvious" hot spot is the failure mode.

Privately per phone: your rumor, your choice, your result. On the host: only aggregate turnout and payouts — never who chose what or who saw which rumor.

## Technical approach
Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{venues:[{id,capacity,basePayout}], round, phase}, Player{id, rumor:{venueId,polarity}, choice, score}. Server deals rumors from a seeded generator ensuring at least one deliberately correlated cluster per round. Sync is turn-based and simple: DEAL → lock window (all choices in, or 20s timeout) → RESOLVE broadcast. No real-time physics; the only hard part is rumor-generation tuning so the correlated-signal trap fires often enough to feel devious without being unwinnable.

## v1 scope
- Exactly 3 players, 3 venues, ONE round.
- Fixed capacities (2 each), one hand-authored rumor deck with a built-in correlated cluster.
- Host shows turnout + payouts + a simple win/bust banner.

## Out of scope
- Multiple rounds, running score, bankrolls.
- Player-planted rumors, bluffing chat.
- Dynamic capacities or venue art.

## Risks & unknowns
- With only 3 players the trap space is tiny; correlated rumors must be tuned or it feels random.
- Could read as pure luck rather than reasoning — needs the rumor to give enough traction to feel like a read.
- Minority games can feel unsatisfying when everyone busts; a consolation payout may be needed.

## Done means
Three phones each show a distinct private rumor; all three lock a venue blind; the host reveals turnout and correctly busts any overcrowded venue and pays a lone chooser — with no phone ever seeing another's rumor or choice before reveal.
