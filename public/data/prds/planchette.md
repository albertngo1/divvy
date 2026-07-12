## Overview
Planchette is a 3–6 player séance-flavored convergence game for a shared host screen (the spirit board) plus one phone per player (a hand resting on the planchette). The room tries to spell a short word together — but no one is allowed to talk, and no one is the designated leader. Everyone must silently pull the same direction at the same time.

## Problem
Most 'work together' party games devolve into one loud person dictating. The itch here is the opposite: a genuinely leaderless act of will, where the tension is feeling the group's intent through resistance in your thumb rather than hearing it. It should feel spooky and emergent, like the board is alive.

## How it works
The host screen shows a classic letter board (A–Z + a small tray of common words) with a single glowing planchette at the center. Each **phone privately** shows only a directional thumb-pad and a faint compass hint of where the planchette currently sits — never other players' inputs. Every 100ms each phone streams its current pull vector (angle + magnitude). The server sums all vectors; the planchette accelerates along the resultant. When pulls conflict, it jitters and stalls; when they align, it glides smoothly. Hovering the planchette over a letter for 1.2s commits that letter to a growing word on the host screen. The room wins when it spells the round's secret target word — which each phone is shown privately at the start, so everyone knows the goal but must still fight the physics of consensus to reach each letter. Backspacing requires the whole room to pull the planchette onto a 'CLEAR' corner, which is comedy gold when half the room wants to fix a typo and half doesn't.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `{ planchette: {x,y,vx,vy}, pulls: {playerId: {angle,mag,ts}}, word: [], target }`. Server runs a 20Hz physics tick: resultant = normalized sum of recent (non-stale) pull vectors, applied as force with heavy damping so motion feels weighty. Only host renders the board; phones get lightweight `{planchetteAngleFromCenter}` at 10Hz. Hard part: making the drag feel intentional not chaotic — needs damping/inertia tuning and stale-pull decay (drop inputs older than 250ms) so an idle phone doesn't anchor the board.

## v1 scope
- One round, one 4-letter target word
- 3 players
- Thumb-pad input only, letter commit on 1.2s hover
- Host board + convergence-driven planchette physics
- Win screen when word matches

## Out of scope
- Multiple rounds / scoring
- 'CLEAR' backspace corner (fake the typo tension later)
- Player-chosen words, spooky audio, haptics

## Risks & unknowns
- Physics feel: too twitchy = chaos, too damped = mush
- Latency: 100ms input jitter could make the board feel disconnected
- Degenerate strategy: one stubborn player can be out-voted — is that fun or frustrating?

## Done means
Three phones on a LAN can, without talking, drive the planchette to spell a 4-letter word within 90s, with the board visibly stalling on conflict and gliding on agreement, and a win screen firing on the exact match.
