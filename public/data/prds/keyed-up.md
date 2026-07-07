## Overview
Keyed Up is a cooperative real-time party game for 3-5 players in one room, played with a shared host screen (the dispatch "Base" board) and each player's phone as a private radio handset. It runs in the Spaceteam / Devils & the Details lineage but around a single hard constraint: the room has exactly one open voice lane, and only one person can transmit at a time.

## Problem
Most "everyone shouts" party games devolve into undifferentiated noise where volume wins. The itch here is the discipline of a real radio net: you have urgent things to report, so does everyone else, and the channel is a scarce shared resource. Fun comes from reading the room by ear — is someone already keyed up? — and threading your transmission into the gaps.

## How it works
Each phone PRIVATELY shows a queue of 3-4 incident cards, each with a countdown bar (e.g. "UNIT 4: fuel leak, bay 2" — 20s). To clear a card you press-and-HOLD the big PTT button, which claims the single voice lane; while holding, you say the incident aloud so the room hears it, then tap the card to file it to Base. The host screen (shared) shows only a coarse CHANNEL light (green=clear, red=busy) plus the running Base log and the team's remaining-incident count — it deliberately does NOT show whose finger is on PTT.

The catch: if two players hold PTT with overlapping windows, the server flags both transmissions as STEPPED ON — any card either files during the overlap is rejected and its timer keeps ticking, plus a short lockout. So players must self-organize turn-taking on the fly, using their ears and the laggy channel light, not a turn indicator. Win = clear every incident before any timer hits zero.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ channel: {holder: playerId|null, since: ts}, players: {id, queue:[{id,label,expiresAt}]}, baseLog[] }`. Phones send `key_down`/`key_up` with client timestamps; the server stamps authoritative receive times, maintains the single-holder lane, and computes overlap. No actual audio is routed — the ROOM's own air carries the voice; the server only arbitrates the lane token and adjudicates collisions. Sync strategy: server broadcasts channel state + queue deltas at ~20Hz; timers are server-authoritative, phones interpolate.

The genuinely hard part is fair overlap detection: deciding whether two PTT presses truly collided needs latency compensation across clock-skewed phones, or a false STEPPED-ON feels deeply unfair. Likely fix: a small grace window (~120ms) and grading overlap by server-receive time, tuned by playtest feel first.

## v1 scope
- 1 round, 90s, 4 players, one shared host tab.
- 3-4 incident cards per phone, single incident type.
- PTT hold, one CHANNEL light, Base log, win/lose screen.
- STEPPED-ON penalty = reject + 1.5s lockout.

## Out of scope
- Real audio routing / voice recognition.
- Card variety, roles, multiple rounds, scoring tiers.
- Reconnect polish.

## Risks & unknowns
- Overlap fairness across latency is the make-or-break tuning problem.
- Does the laggy channel light help or frustrate? May need audio sidetone instead.
- Could collapse into people just yelling if the lockout is too soft.

## Done means
Four phones on a LAN, one host screen; the team can clear all incidents only by taking turns on the lane, and deliberately double-keying reliably produces a STEPPED-ON rejection within ~150ms — proving the single-lane tension is real and fair.
