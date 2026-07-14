## Overview
Cold Storage grafts the DayZ survival loop onto homelab media hoarding. It's a dashboard/game for people running Jellyfin + Sonarr/Radarr + qBittorrent who keep grabbing content faster than they watch it. Your NAS becomes a survival map where loot rots, resources deplete, and neglect has consequences.

## Problem
The *arr stack makes acquisition frictionless and consumption invisible. Drives quietly fill with shows you'll 'get to', downloaded-but-never-watched movies pile up, and the only feedback is a disk-full alert at 2am. There's no felt cost to hoarding. DayZ's genius is that everything you carry has weight and food spoils — scarcity you *feel*. Cold Storage borrows exactly that.

## How it works
Each media item is 'food' with a freshness clock that starts ticking from the day it landed. Unwatched items lose freshness on a half-life; at 'spoiled' they get flagged for the cull pile. Free disk space is your **health bar** — as it drops toward full, a 'winter' meter rises and the whole UI cools to blue and frost. 'Eating' = marking watched in Jellyfin (auto-detected) or deleting; both restore health and clear spoilage. A weekly 'night' summary tallies what you survived on, what rotted, and issues a survival verdict ('you hoarded 340GB of prestige TV and ate none of it'). Optional ntfy pings when something's about to spoil or winter is closing in.

## Technical approach
- Python/FastAPI service polling: Jellyfin API (watch state, last-played), Sonarr/Radarr (`history`, file paths, added dates), and `df`/`du` for real disk pressure.
- Data model: `item{path, size, added_at, last_watched, freshness, state}`; freshness = `exp(-Δt / half_life)` tuned per-type (a movie spoils slower than a weekly episode).
- Frost/winter shader is CSS/Canvas over a simple SvelteKit or plain-HTML front end; health = `1 - used/total` on the media volume.
- 'Eat = delete' actions call Radarr/Sonarr delete endpoints (with a proof-style confirm) so it actually reclaims space.
- Hard part: inferring genuine watch state reliably across Jellyfin users and matching library files back to *arr history without dupes.

## v1 scope
- Read-only board: pull Jellyfin + one *arr, compute freshness, render a frosted grid sorted by spoilage.
- Disk-health bar from `df` on the media mount.
- Weekly text summary to stdout/ntfy.

## Out of scope
- Actual auto-deletion (v1 only *flags*).
- Multi-user survival scoring.
- Mobile app.

## Risks & unknowns
- It's a themed dashboard at heart — the survival framing has to earn its keep or it's just Tautulli with frost.
- Watch-state matching across Jellyfin/*arr is the classic ID-reconciliation headache.
- Nudging deletion could make someone trash something they wanted; deletes must be explicit and reversible via trash.

## Done means
Pointed at Albert's Jellyfin + Sonarr, the board shows real files with per-item freshness, the health bar reflects actual `df` free space on the media volume, and letting an unwatched episode sit a week visibly frosts it into the spoiled pile.
