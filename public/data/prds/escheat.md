## Overview
Escheat is a self-hosted dashboard/launcher for your Steam library that enforces a personal 'play it or forfeit it' rule. Inspired by the HN story that PlayStation (EU) can delete digital games after 3 years of inactivity — a dystopian policy, but the underlying nudge works. Escheat inflicts it on you voluntarily to burn down your backlog. For the person with 400 owned games and 30 played.

## Problem
Huge unplayed backlogs generate low-grade guilt and zero action. Wishlists and 'someday' piles never resolve. You need either a reason to finally play a game or permission to let it go — and a neutral system to force the decision instead of endless deferral.

## How it works
Escheat imports your Steam playtime and gives every owned-but-unplayed title a countdown (default 30 days). As the clock runs, the game's tile dims and frosts over. When it expires the game 'escheats' — it's hidden behind a lock and added to a docket where you must either RECLAIM it (play 15 minutes, which resets it to full brightness) or ABANDON it (mark it dead, banished from view). A weekly 'docket' email/ntfy surfaces what's about to escheat this week. Launching any game via `steam://` resets its decay.

## Technical approach
Node + SvelteKit, self-hosted alongside the homelab. Data from the Steam Web API `IPlayerService/GetOwnedGames` (returns `playtime_forever` and `rtime_last_played`), polled hourly. SQLite stores per-game decay state; brightness = exponential decay on days-since-last-played with a configurable half-life. Play detection = diffing `playtime_forever` between polls. Optional launch buttons via `steam://run/<appid>`. Weekly docket via the existing ntfy instance. The genuinely hard part: it *can't* (and shouldn't) actually delete anything, so the stakes are purely psychological — the forfeit ritual has to feel real enough to motivate without curdling into more guilt-ware.

## v1 scope
- Import a Steam ID, render every unplayed title with a live decay meter
- Escheat docket with working Reclaim / Abandon buttons
- Hourly poll; manual 'played' detection via next poll (no launching yet)

## Out of scope
- Actually deleting or hiding games in Steam itself
- Non-Steam stores (GOG, Epic, consoles)
- Mobile app

## Risks & unknowns
Cosmetic-only stakes may not motivate anyone; Steam API key + rate limits; the whole genre risks being backlog-guilt fatigue. The abandon ritual is the make-or-break UX.

## Done means
Entering a Steam ID renders every unplayed title with a live, correctly-decaying meter, and a title untouched past its window appears in the escheat docket with Reclaim and Abandon actions that persist across restarts.
