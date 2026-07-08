## Overview
Sweat is a private live-betting overlay on top of a short clip the whole room watches together. It's a nerve-and-greed game: the fun isn't guessing right, it's deciding the exact second to cash out while a live line drifts under you. Built for 3-6 friends on a couch around one TV, each with a phone.

## Problem
Watching a clip together is pure passive consumption. "I bet it falls" dies as a throwaway comment — no stakes, no memory, no shared tension. Group viewing has a built-in dramatic climax (the reveal) that nobody is allowed to *play*. There's no sweaty, simultaneous, hidden pressure over a screen everyone's already staring at.

## How it works
The host plays a curated ~90-second clip built around ONE slow numeric climax: how many dominoes topple, how tall the tower gets before it falls, will the dropped egg survive. The host sets an over/under line before it starts. Each phone PRIVATELY opens one position — OVER or UNDER — and stakes chips. As the clip plays, a live cash-out multiplier for each side drifts (driven by how the room's money split + a scripted confidence curve keyed to video timestamps). Each phone privately shows: your side, your stake, your live cash-out value ticking up or down, and a big CASH OUT button. The shared TV shows ONLY the clip, the current line, and an anonymous money-split bar — never who holds what, never who bailed. At the reveal, every unsettled position wins or loses in full. Private, simultaneous cash-out under a moving line is the entire game: you literally cannot tell whether the person next to you already chickened out — that's why one passed-around phone destroys it.

## Technical approach
Host browser tab + phone PWAs + an authoritative WebSocket server (PartyKit Durable Object per room, over Tailscale Serve). Data model: Room{clipId, line, phase, tick, sideMultipliers}, Position{playerId, side, stake, cashedOutAt|null, settled}. The server owns a monotonic ~10Hz tick and broadcasts sideMultipliers; a cash-out is a client *intent* the server timestamps against its own tick, so nobody can lock the last favorable frame. The genuinely hard part is fair real-time settlement: cash-out value must be computed server-side at the tick the intent *arrived*, not the client's optimistic display value, and the reveal must settle all remaining positions atomically. Because the clip's outcome is pre-known metadata, settlement math is deterministic — the only true real-time demand is the multiplier broadcast plus correctly ordering near-simultaneous cash-outs.

## v1 scope
- 1 hand-picked clip, exactly 3 players
- One over/under line, 100 chips each, fixed
- Scripted multiplier curve (no real pari-mutuel)
- Single CASH OUT button, one reveal, final leaderboard

## Out of scope
- Player-uploaded clips or auto-detected outcomes
- True pari-mutuel odds from live money flow
- Parlays, multiple simultaneous lines, seasons/tournaments

## Risks & unknowns
- Multiplier-curve tuning: too flat and there's no sweat, too swingy and cash-out is a coin flip
- Cash-out ordering fairness under phone latency
- Clip curation is manual and taste-dependent

## Done means
Three phones each hold a hidden position on one clip; at least one player cashes out early for partial value; the server settles the remaining positions at the reveal; the TV shows correct final chip counts with no identity leakage during play.
