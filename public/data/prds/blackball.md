## Overview
Blackball is a concurrent-room convergence game for 3–4 players. Shared host screen shows eight shared options; each phone is a private, live veto pad. Unlike additive convergence games (everyone drifts toward each other), Blackball converges by *subtraction* — and has a failure floor that makes your stomach drop.

## Problem
Synchrony games almost always ask players to move *toward* a shared value. That's gentle. Blackball inverts it: the only tool is a secret negative vote, and over-cutting is fatal. This creates live, silent risk-management — 'do I dare cut this one, or is it the last thing someone's protecting?' — an anxiety no additive game produces.

## How it works
The host shows eight tiles (icons/words). Each tile is either **alive** (no one is currently vetoing it) or **greyed** (at least one player vetoes it). Crucially the host shows *only* alive/dead per tile — never the veto *count*, never *who*. **Each phone privately shows:** the same eight tiles with toggles; tap to add/remove your own veto. Your veto set is live, editable, and never revealed. You're reading the room: which single option will everyone be least willing to cut? You want to keep the eventual survivor alive while the room trims everything else — but if the room collectively vetoes all eight, you lose. When a tile flips alive→dead it pulses on the host so you feel the room acting, but you never learn who or how many.

Win: exactly one tile alive, held 3 seconds. Lose: zero tiles alive.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {options:[8], vetoes:{playerId: Set<optionId>}}`. Phones emit veto toggle events; the server recomputes, per option, `alive = no player vetoes it`, then broadcasts only the boolean `alive[]` mask to everyone — never raw counts. Convergence check: `count(alive) === 1` stable for 3s → win; `count(alive) === 0` → lose. Sync: authoritative server, last-write-wins per player, debounced toggles. The genuinely hard part is preventing count leakage (the mask must be pure booleans) and tuning the lose condition so the game is tense but doesn't instantly collapse to zero.

## v1 scope
- Eight hard-coded options
- 3–4 players
- One board, no timer, no scoring
- Win = exactly-1-alive held 3s; Lose = 0-alive

## Out of scope
- Multiple rounds / themed option packs
- Strike systems, timers, scoring
- Veto-budget caps (see risks)

## Risks & unknowns
- Nervous rooms may nuke everything instantly — likely needs a soft cap ('you may veto at most N at once') to slow the collapse.
- Or it stalls forever at two-alive with no one willing to cut — may need gentle pressure. Balancing the veto cap is the central unknown.
- Per-phone privacy is load-bearing: the whole game is hidden *simultaneous* negative votes; a single passed-around phone destroys it entirely.

## Done means
Three phones each toggling private vetoes; host tiles grey out live with no counts leaked; the room can drive it to exactly one alive tile held 3s (win) and can also accidentally hit zero-alive (lose) — both end states fire correctly and neither leaks who vetoed what.
