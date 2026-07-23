## Overview
Rung is a cooperative, silent, ascending-order game for 3-5 players — a phone-native riff on *The Mind*. Each player secretly holds a number and the whole room must play those numbers in ascending order, together, with no talking, gestures, or signals. It's for anyone who loves the held-breath tension of unspoken timing.

## Problem
*The Mind*'s magic is telepathic timing, but the physical game leans on honor-system simultaneity ("I dropped first!") and can't prove who acted when. It also relies on numbered cards you must not flash. Phones fix both: the server is an impartial millisecond referee, and your number is *architecturally* private — there's nothing to accidentally reveal.

## How it works
The server deals each phone one hidden number (v1: unique, 1-100). The **shared TV** shows only the rising stack of already-played numbers, the hearts (lives) remaining, and the count still out — never an unplayed value. **Each phone privately shows ONLY its own number** and a big hold-to-PLAY button. When you believe you hold the lowest number still out, you press and release PLAY. The server timestamps your release and checks: is your number the lowest remaining? If yes, it slots onto the TV stack with a satisfying climb. If someone was holding lower, a heart shatters and the TV names the exact miss — "played 47, but 31 was still out — 220ms apart." A photo-finish rule: two releases inside an ~80ms window, if in correct order, both count as a clean "sync" (the crowd-pleaser moment). Privacy is load-bearing: the fun IS that nobody can see or say their number; a single passed phone collapses the game entirely.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {players[], stack[], hearts, phase}`; `player {id, number, played}`. Sync: server is sole source of truth; PLAY sends a client event, but the server orders by server-receive time adjusted by a per-client clock-offset + RTT estimate captured at join. The genuinely hard part is fair sub-100ms ordering across heterogeneous phone networks: mitigate with a ~120ms **commit window** — when a PLAY arrives, briefly wait for any lower straggler before finalizing, so a slightly-laggy lowest card still wins. TV subscribes to 30Hz state broadcasts.

## v1 scope
- 3 players, one round, exactly one card each (three numbers, ascending)
- 3 hearts; unique numbers 1-100
- TV: stack + hearts + mistake flash with millisecond gap
- Phone: own number + PLAY button only

## Out of scope
- Multi-card hands, levels, throwing-stars/reveal powers
- Reconnection mid-round, spectators, subjective-scale variant

## Risks & unknowns
- Sub-100ms fairness across real networks (core risk)
- Is one-card-each too trivial? May need 2 cards to feel tense — but ship 1 and test
- Clock-offset estimation accuracy; players staring each other down (accept it — that's the fun)

## Done means
Three phones each show a distinct hidden number; playing out of order breaks a heart and the TV names the exact miss with its millisecond gap; playing all three ascending wins and shows the assembled 1-2-3 stack; two correct plays inside the sync window register as a clean sync, not a miss.
