## Overview
In Running takes the purest form of passive group watching — a short race clip you'd normally just cheer at — and turns it into an in-play betting floor. For 3–6 people, using a bundled, deterministic ~20-second race (marble run, ice-cube-melt, escalator-of-avatars), where the outcome is fixed but suspenseful and each player secretly holds different pre-race intel.

## Problem
Watching a race together is fun for exactly one moment: the finish. Everything before is dead time. Real betting fixes this — but passing one phone around kills the simultaneity, and public bets let everyone just copy the confident person. The tension only exists if bets are private, intel is asymmetric, and you can react live.

## How it works
The host screen shows a lobby of 4 racers (colored marbles) with public odds. Before the gate drops, each phone privately receives a **different tip card** — a single true-ish stat about one racer ("Green cleared the last drop fastest in warm-ups," "Blue tends to fade on straights"). Some tips are gold, some are noise; you don't know which, and you can't see anyone else's. You privately place a hidden stake on one racer.

The gate drops; the clip plays on the host TV with a live odds ribbon (aggregate money only — never who's on whom). Exactly once, during a mid-race **"in running" window** (~second 10), each phone may secretly move its entire stake to a different racer at the odds showing then. The board flashes that *someone* repositioned, but not who or where — so a late swing is information warfare. The clip resolves deterministically; the server pays out at locked odds. Highest bankroll wins.

Per-phone is load-bearing three ways: divergent private tips, simultaneous hidden stakes, and a secret mid-race switch. A single passed phone can't hold three people's private intel or let them react at once.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). The race is a pre-rendered video with a known, hard-coded finish order and per-second position keyframes bundled with the app — so resolution is server-truth, not video parsing. Data model: `Race{clipId, finishOrder, oddsRibbon}`, `Player{tipCardId, stake:{racerId,amount}, switched:bool}`. Sync: server drives a synchronized playback clock (sends `startAt` timestamp; phones and host align to it) so the in-running window opens at the same wall-clock instant on every device. Stakes and switches are server-held, revealed only at payout. Hard part: keeping the host video and phone betting-window clocks tight enough (<150ms) that the window feels simultaneous, plus authoring tip cards whose signal-to-noise makes reading your own tip a real decision rather than obvious.

## v1 scope
- 3 players, one bundled 20-second marble clip, 4 racers.
- One pre-race hidden stake + one mid-race switch window.
- 3 hand-authored tip cards (one per player), fixed finish order.
- Aggregate odds ribbon; payout at locked odds.

## Out of scope
- Multiple races / seasons, user-uploaded clips.
- Continuous in-play trading, cash-out, partial stakes.
- Real odds engine — v1 odds can be static then move only on the switch.

## Risks & unknowns
- Clock sync across phones for the switch window is the make-or-break.
- 20 seconds may be too short for a meaningful mid-race decision — may need 30s.
- Tip-card balance: too true = solved, too noisy = random.

## Done means
Three phones join, each privately reads a different tip and places a hidden stake; a synchronized marble clip plays on the host with an aggregate-only odds ribbon; every phone gets a simultaneous mid-race switch window and at least one player secretly repositions without being identifiable; the server resolves the fixed finish, pays out at locked odds, and names a winner.
