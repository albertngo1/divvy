## Overview
Sway turns a passively-watched head-to-head clip — a foot race, a cook-off finish, an ice-cube-melt, two soda cans shaken and cracked — into a private, continuous betting duel. 3–6 friends watch the same clip on the TV while each privately rides a conviction slider. It's for a living-room group that likes hot takes and getting caught being confidently wrong.

## Problem
Watching a suspenseful reveal together is fun but flat: you shout a guess, it resolves, done. Binary group predictions collapse the moment the outcome tips obvious — everyone piles onto the leader with no cost. There's no reward for *conviction under uncertainty*, and no record of who committed early versus who waffled.

## How it works
The host TV shows the clip and a neutral timeline — **no live aggregate**, or the room would herd. Each phone PRIVATELY shows a two-sided slider: drag left toward contestant A, right toward B, magnitude 0–100. You move it continuously as the clip plays. You may flip sides, but each flip costs a small chip tax, so waffling bleeds you.

Score = the integral over time of `conviction(t) × sign(eventual winner) × dt`. Backing the winner early and hard banks points every second; sitting on the loser drains them. The genius is the tax-on-flips + hidden state: because nobody sees your slider, you can't free-ride the crowd, and because you commit *before* it's obvious, the early gut-call is where points live.

At reveal the host overlays every player's conviction ribbon on the clip timeline, synced to key moments, with the running score climbing — exposing the person who shoved all-in on the loser at second 3.

Private, simultaneous, continuous per-phone input is the whole point: one passed phone cannot capture three people's live conviction curves, and any shared view would destroy the anti-herding tension.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{clipId, outcome?, players[]}`, each player streaming `{t_server, conviction}` samples throttled to ~10 Hz. Server timestamps on receipt (LAN RTT is small), stores the piecewise-constant curve, and on host-entered outcome computes each integral. Sync strategy: phones are dumb input surfaces; server is truth. The genuinely hard part is honest scoring without a synchronized clock across phones — solved by timestamping server-side and treating gaps as held-value, plus a fixed clip whose known duration bounds the integral.

## v1 scope
- 3 players, one ~30s clip with a clean binary outcome.
- One conviction slider, flip tax fixed.
- Host manually taps the winner at the end.
- Reveal = ribbon overlay + final scores. No accounts, no rounds, no chips economy.

## Out of scope
- Multi-outcome / 3+ contestants.
- Automatic outcome detection from video.
- Persistent bankrolls across games, matchmaking, mobile app store builds.

## Risks & unknowns
- Choosing clips with a *late* tipping point (early-obvious clips kill the fun).
- 10 Hz streaming from 3 phones over flaky Wi-Fi; may need client-side interpolation.
- Integral scoring may feel opaque — needs a legible reveal animation to teach itself.

## Done means
Three phones each drive a private slider through a 30s clip; the host taps the winner; the TV shows three distinct conviction ribbons and a correctly-computed score where the earliest heavy backer of the winner ranks first.
