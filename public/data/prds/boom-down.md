## Overview
A 3-player cooperative real-time game for a party crowd. One player is the crane OPERATOR working from a cab with a blocked view; the other two are ground SPOTTERS, each watching a different sliver of the job site. The operator can move the load but can't see where it's going; the spotters can see but can't touch a single control. The game is the shouting in between.

## Problem
Every voice-coordination party game eventually collapses into one person just looking at the shared screen and doing it themselves. The itch is a scenario where seeing and acting are physically split across different phones so that *nobody* can shortcut the talking — the way a real blind crane lift genuinely depends on a rigger's continuous callouts.

## How it works
The server runs an authoritative physics sim of a load on a cable (position x/y/z plus real pendulum swing). Inputs and views are split:
- **Operator's phone (PRIVATE):** three lever controls — SLEW (rotate), TROLLEY (in/out), HOIST (up/down) — plus a deliberately useless cab-eye view (you see boom and sky, not the ground). Acting, no useful seeing.
- **Spotter A's phone (PRIVATE):** a top-down camera showing the load's HORIZONTAL alignment vs. the target pad. Sees left/right/in/out error, blind to height.
- **Spotter B's phone (PRIVATE):** a side camera showing VERTICAL clearance and the one obstacle (a wall) the load must weave over then down behind. Sees height and collisions, blind to horizontal.
- **Host TV (SHARED):** a dramatic wide shot of the swaying load, a collision-warning flash, and the 90-second clock — vivid for spectators but too coarse to guide the lift.
Because horizontal placement and vertical clearance live on different phones, spotters must interleave callouts ("boom DOWN"… "no, hold, swing LEFT first"), and the operator must act on voice alone. Win: set the load on the pad within tolerance, no collision, before the clock.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. **Data model:** room{loadState:{x,y,z,swingVx,swingVy}, controls:{slew,trolley,hoist}, obstacle, pad, clock, result}. **Sync:** operator streams lever deltas at ~30Hz; server steps the pendulum sim and broadcasts loadState at 20Hz; each phone renders its private crop client-side. **Hard part:** a stable, satisfying pendulum under 100–150ms latency — sway must feel physical and punish jerky inputs without becoming unpredictable. Tune damping + input smoothing so voice lag is forgiving but momentum still creates real stakes.

## v1 scope
- Exactly 3 players, fixed roles, one round.
- One load, one target pad, one wall obstacle.
- One camera per spotter, three levers, 90s timer.
- Binary win/lose + a settle-accuracy score.

## Out of scope
- 4+ players / role rotation / multiple loads.
- Wind, weight limits, multiple obstacles.
- Spectator voting, cosmetics, campaign.

## Risks & unknowns
- Pendulum + latency could feel floaty or twitchy — core tuning risk.
- Two spotters may talk over each other unproductively rather than interleaving; needs a clear "one axis each" framing.
- Rendering three distinct camera crops from one sim state must stay cheap on phones.

## Done means
Three phones on a LAN complete a lift: operator sees only levers + sky, each spotter sees only their axis, and the group lands the load on the pad within tolerance with no collision, driven entirely by voice, inside 90 seconds — with a reset-and-replay button.
