## Overview
Eyes Only is a 3-player cooperative panic game for a TV plus phones. The shared screen holds the master schematic every player needs — and it is black. Any player can hold EYES to reveal it, but only one at a time, only for a shared 30-second budget, and while holding it their own phone screen goes completely dark. The room's central problem is deciding who gets to look, when, and what they should memorize while they're up there.

## Problem
Every co-op party game treats the TV as a free public good — always visible, always glanceable. That makes the shared screen a passive backdrop. Making *looking* the contended resource turns attention itself into the thing you negotiate over, which is what real ops rooms actually fight about: who has the manual, and is anyone covering their station.

## How it works
Each phone privately owns four labeled controls (dials A–D, values 0–9) and a private queue of job cards. A job card reads: **"Set dial C to the value in cell R2"**. The cell values live only on the TV schematic — a 4×4 grid of numbers. Your phone never shows them.

The TV is blacked out by default. A big **EYES** button sits on every phone. Hold it and the TV reveals the full schematic; release and it blacks out instantly. Constraints:

- Exclusive: one holder at a time. Losers see "TAKEN — DANA".
- Costly: while you hold EYES, *your own phone screen is black*. Your job cards are invisible and their TTLs keep running.
- Rationed: a single shared 30-second budget for the whole 120-second round, drawn down live as a bar on the TV.
- Sticky: 1.5-second cooldown after release before you can re-grab, so nobody camps it.

So the holder becomes a query service. The room shouts questions at them — "R2? give me R2 and C4" — and they answer from a screen the askers can't see, while their own dials time out. The natural strategy that emerges is one player reading the whole grid aloud once while the other two frantically transcribe by ear, then everyone working from memory until someone's confidence breaks.

Host screen shows: black, or the schematic while held; plus timer, EYES budget bar, and a row of three job-completion pips. Never anyone's dials.

## Technical approach
Host tab + phone PWAs + Socket.IO server behind Tailscale Serve (or a PartyKit DO).

Data model: `Room {code, tRemaining, schematic: number[16], jobs: {id, playerId, controlId, targetCell, ttlMs, state}, dials: {playerId: {A..D: 0-9}}, eyes: {holderId|null, budgetMs, cooldownUntil: {playerId: ts}}}`.

Sync: 10Hz authoritative tick. Dial changes are last-write-wins per control, echoed only to the owning phone. Job resolution is server-side against the true schematic.

The hard part is the EYES lock. It must be mutually exclusive under real phone latency (grab is a request, not a local state change — the button shows PENDING until the server grants), metered by *server* elapsed time rather than client hold duration so a laggy phone isn't charged for transit, and auto-released after 500ms of missed heartbeats so a backgrounded phone can't hold the room's only manual hostage. Reveal/blackout on the host must be driven by server events, never by an optimistic client.

## v1 scope
- Exactly 3 players, one 120-second round, 4-letter join code
- One fixed 4×4 schematic, 9 job cards total, staggered, 25s TTL each
- 4 dials per phone, tap-to-increment, no gestures
- EYES: exclusive lock, 30s shared budget, 1.5s cooldown, phone blacks out while held
- End screen: jobs completed out of 9, seconds of EYES used

## Out of scope
Multiple rounds, generated schematics, 4+ players, audio, scoring leaderboards, reconnect-mid-round UX beyond auto-release.

## Risks & unknowns
- The room may just burn all 30 seconds in one read-aloud in the first 20 seconds and then coast. If that trivializes it, add mid-round schematic mutation in v2 — but v1 should ship without it and see.
- Blacking out the holder's phone may read as a bug rather than a rule; needs an unmistakable "YOU HAVE EYES" full-bleed state.
- 4×4 of digits may be too memorizable. Swap to glyph cells if playtest says so.

## Done means
3 phones and a laptop on one LAN. A round runs where the EYES lock is never held by two phones simultaneously (verified in server logs), the budget bar reaches zero from server-side accounting alone, and at least one player audibly asks another to read a cell out loud.
