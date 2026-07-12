## Overview
Odds-On is a live bookmaking party game for 3-5 players. Each round one player becomes "the Act" and attempts a small stunt; everyone else is the book, privately wagering on the outcome. It converts the most passively-consumed thing at any party — watching one friend do a bit while everyone else spectates — into a hidden betting market with real skin in the game.

## Problem
Party stunts ("name 8 pizza toppings in 25 seconds!") have exactly one person with stakes: the performer. The audience watches, mildly amused, contributing nothing. Meanwhile everyone privately has a strong read on whether their friend will crash — that instinct is the untapped fun.

## How it works
The server picks one player as the Act and deals a challenge card to their phone ONLY (e.g., "Name 8 pizza toppings in 25s"). The host screen announces the challenge publicly so bettors know the line, plus a betting-open countdown. Each spectator phone privately sets two things: a **side** (will the Act succeed?) and a slider **guess of the exact count**, then wagers chips. Bets are hidden and simultaneous — the host shows only `2/2 locked`. The Act must stay blind to the line.

On lock, the Act performs out loud on the host "stage" while a live tally ticks up on the TV. Reveal the true result; payout is parimutuel on the correct side, with a bonus split to whoever nailed the count. The Act can't bet on themselves — they earn a flat completion bonus, so they're motivated to genuinely try rather than tank the line.

Per-phone is load-bearing: the Act must not see the bets (a passed phone exposes the line and lets them game their effort), spectator sides/counts are secret from each other, and the lock is simultaneous.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Model: `Room{phase, actId, challenge, result}`, `Player{id, chips, bet:{side, count, chips}}`. Server sends the challenge card only to `actId`, hides all bets from everyone, and broadcasts only a lock-count to the host. During the performance the Act (or host) taps an increment button; the server broadcasts the running count to the host screen with low latency. Payout computes parimutuel-plus-closest-bonus. The genuinely hard part is fair adjudication of open-ended human tasks — solved v1 with honor-system self-report plus a host "call it" override button.

## v1 scope
- 3 players, one round, one Act
- binary success + count-slider bet, one challenge card
- private challenge to the Act only; blind, simultaneous spectator bets
- honor-system adjudication with a host override

## Out of scope
- rotating multi-round rounds, dynamic in-play odds, video capture, automated verification, an oddsmaker role

## Risks & unknowns
Self-report cheating (mitigated by group veto button). Act sandbagging to skew payouts (mitigated by no self-betting + flat completion bonus). Adjudication disputes on fuzzy challenges.

## Done means
The Act sees a task nobody else sees; two bettors privately lock side + count without leaking; the Act performs; the host shows a live count; payouts resolve correctly; the line stayed blind to the Act throughout.
