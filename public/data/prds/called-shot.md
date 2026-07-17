## Overview
Called Shot is a 3–6 player concurrent-room game where the group passively watches a short competition or reveal clip on the shared TV — a cook-off tasting, a talent-show audition, a 'which door has the prize' reveal — and each player privately races to lock in the outcome. It's for people who shout predictions at the screen; here the shout is a silent, timed, blind bet.

## Problem
Watching a reveal-format show together is passive: everyone half-guesses out loud, the loudest voice anchors the room, and nobody's on the hook. There's no cost to a late, obvious call and no reward for the brave early one. The itch: make conviction *timing* the whole game, privately, so nobody front-runs anybody.

## How it works
The host TV plays a ~40–90s clip with a known outcome the server holds secretly (e.g. three chefs, one wins). A live **decay multiplier** ticks down as video time elapses: locking at 0:05 pays 5×, at 0:40 pays 1.4×, after the cutoff frame (just before the reveal) locks are refused. Each phone PRIVATELY shows the choice buttons (Chef A/B/C) and its own current multiplier, live. You tap to lock exactly one choice at the moment your gut fires — then your phone greys out and shows only 'locked at 3.2×'. You never see when or what others locked. The shared TV shows only the clip plus a tension bar: 'N still holding.' When the outcome reveals, correct locks pay choice-value × their frozen multiplier; wrong locks pay nothing. Host then shows a timeline: every player's lock dot, its multiplier, and the payout — the shock of seeing someone nailed it at 4× while you flinched late.

Per-phone is load-bearing: the entire fun is that your multiplier is decaying in real time on *your* screen while you privately weigh 'do I know enough yet?' — with one shared passed phone there's no simultaneous independent timing, no hidden conviction, and the herd instantly anchors.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object over Tailscale Serve). Data model: `Room{clipId, outcome, videoStartedAt, cutoffMs, players[]}`, `Player{id, lockChoice, lockMs, multiplier, payout}`. The host video element is the master clock; it broadcasts `videoTimeMs` at ~4Hz. Phones compute their displayed multiplier locally from the last tick + local interpolation, but the *authoritative* multiplier is recomputed server-side from `lockMs` on receipt, so client clock skew can't cheat the payout. Genuinely hard part: a late-lock exploit — a player who spots the reveal frame and locks in the last 200ms. Mitigated by a server cutoff `videoTimeMs >= cutoffMs` (set safely before the reveal) plus rejecting locks whose round-trip-adjusted timestamp lands past cutoff.

## v1 scope
- 3 players, ONE bundled 60s clip, one round.
- Three-way choice, single decay curve, single lock per player.
- Host shows clip + 'N holding'; reveal timeline screen.

## Out of scope
- Multiple clips / a library, buy-in stakes, cash-out-before-reveal, partial hedging.
- Player-uploaded clips; automatic outcome detection.
- Persistent scores across rounds.

## Risks & unknowns
- Video sync jitter making the displayed multiplier feel unfair vs. the settled one.
- Cutoff tuning: too early kills late-info drama, too late invites reveal-frame sniping.
- Sourcing clips with a crisp, unambiguous, server-known outcome.

## Done means
Three phones join via QR, the host clip plays, each phone locks a choice at a different time and sees its frozen multiplier, late locks past cutoff are refused, and the reveal screen shows correct timeline dots with payouts = choice × multiplier.
