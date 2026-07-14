## Overview
Cinch is a 3-player cooperative convergence game for a shared host screen and per-phone private controllers. Each player controls a hidden dial (0–100) that only ratchets upward — it can never decrease. The room must silently maneuver all three dials to the same value. The one-way constraint is the whole game: you approach from below in lockstep, because a single impatient overshoot is permanent and poisons the round.

## Problem
Free-slider convergence games let anyone correct a mistake, so there's no cost to guessing. Cinch removes the undo. Irreversibility turns 'match the room' into a tense creep: nobody wants to move first, nobody can walk back, and per-phone privacy is essential because if inputs were shared you'd just copy the leader — the drama lives entirely in each dial being hidden and one-way.

## How it works
Host screen (shared): a single 'strap tension' bar and a spread meter — how tightly the three hidden dials are clustered (max minus min), shown as a fuzzy 'slack' gauge, NOT the actual values. As dials climb and converge, the strap visibly cinches tight. It also shows the round timer (60s).

Each phone (private): a big vertical dial showing only YOUR current value and a hold-to-crank button. Holding advances your dial upward at a steady rate; releasing stops. You cannot decrease. You see nobody else's value — only the shared slack gauge on the TV. You're guessing, from the gauge's tightening/loosening as everyone moves, where the room is settling.

Win: when all three dials are within a tolerance band (±3) of each other AND held stable for 2 seconds, the strap 'cinches' and the room wins. Lose: timer expires, or the spread can no longer close because someone ratcheted past where the others can still climb to before time... they can, since others go up — so the real failure is running out the clock while one player sits far above the pack, forcing everyone into a painful high-value chase.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { phase, dials:{playerId:float}, timerEnd }`. Phones stream crank deltas at ~10Hz; the server integrates each dial with a monotonic clamp (`new = max(old, old+delta)`) so no client can lower a value even by spoofing. Every tick the server computes spread = max−min and broadcasts ONLY that scalar to the host and a stability countdown when spread ≤ tolerance. The hard part is authoritative monotonicity + latency: crank input must feel instant on-phone (optimistic local integration) while the server remains the sole truth for the win check, and it must leak nothing but the aggregate spread or players reverse-engineer positions.

## v1 scope
- Exactly 3 players, one host, one 60s round.
- Single 0–100 dial each, hold-to-crank, monotonic.
- Shared slack gauge + 2s-stability win check.
- End reveal of all three final values.

## Out of scope
- Multiple rounds, scoring, difficulty, >3 players.
- Decrement/undo, per-player handicaps.
- Reconnection, spectators.

## Risks & unknowns
- Tolerance/timer balance: too loose and it's trivial, too tight and irreversibility makes it unwinnable — needs playtest tuning.
- The slack gauge may give too little signal to locate the target; consider a coarse 'we're above/below center' hint.
- One overshooting griefer can force a joyless high chase; acceptable for co-op but note it.

## Done means
Three phones join, each cranks a private monotonic dial, the host shows only a spread-based slack gauge, and the room triggers a 'cinch' win when all three values sit within ±3 for 2 continuous seconds — with the server rejecting any downward movement.
