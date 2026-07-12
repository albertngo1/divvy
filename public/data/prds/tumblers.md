## Overview
Tumblers is a 3–5 player silent-consensus game for a shared host screen (a bank vault) plus one phone per player (a private 3-dial combination lock). There is no correct combination — the room simply has to *agree* on the same one, blind, guided only by aggregate feedback. A pure Schelling-point convergence puzzle with a heist skin.

## Problem
Convergence games often lean on drawing or motion. This one wants the cold, cerebral itch of Mastermind: reasoning about what number *everyone else* would obviously pick, adjusting when the group is close but not quite, and the satisfying clunk when three strangers' minds land on the same arbitrary digit.

## How it works
Each **phone privately** shows three thumbwheel dials (0–9) plus a big LOCK IN button; no phone ever sees another's dials. Each 'attempt', all players set their three dials and lock in simultaneously. The server computes, **per dial position**, how tightly the room's values cluster — and the host screen shows only three 'agreement meters' (e.g. dial 1: three bars nearly touching = hot; scattered = cold) with NO numbers revealed. Players must infer *which* value the room is gravitating toward without being told it, and steer their own dial to the emerging Schelling point. When all players' three dials are identical, the vault swings open with a satisfying clunk and reveals the shared code. The drama is the near-miss: two dials perfectly agreed, one lone dissenter dragging a meter cold, and everyone silently guessing whether to hold or fold.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `{ round, locks: {playerId: [d1,d2,d3]}, attempts: [] }`. On each simultaneous lock-in the server computes per-position dispersion (circular stddev, since dials wrap 9→0) and maps it to a 0–100 agreement score; only the score reaches the host, only 'your dials' reach each phone. Sync is turn-gated (all-lock-in barrier), so no hard real-time — the challenge is the *information design*: the aggregate feedback must be rich enough to converge on yet reveal no actual values. Hard part: tuning the meter so the room reliably converges in a handful of attempts without it feeling either impossible or trivially solvable.

## v1 scope
- One round, 3 dials (0–9), 3 players
- Simultaneous lock-in barrier, per-dial circular-dispersion meter
- Host vault + three agreement meters; win = all locks identical
- Attempt counter, open-vault reveal animation

## Out of scope
- Scoring across rounds, attempt limits/timers
- Variable dial counts or ranges
- Any hint of actual dial values on the host

## Risks & unknowns
- Convergence rate: might stall forever with no numeric anchor — may need a subtle 'the room's most common value moved' nudge
- Fun ceiling: risks feeling like blind guessing rather than reasoning
- Wrap-around math (circular stddev) must read intuitively as a meter

## Done means
Three phones on a LAN can reach an identical 3-dial combination within ~5 simultaneous attempts using only the per-dial agreement meters, with the vault opening exactly on unanimous match and no dial values ever shown on the host screen.
