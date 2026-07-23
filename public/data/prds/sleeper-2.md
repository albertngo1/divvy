## Overview
Sleeper is a 3–4 player cooperative overload game — Spaceteam turned inside out. Instead of shouting a command and hoping someone has the matching control, every order is addressed to a secret CODENAME, and only its owner knows they're the target. You spend the round doing two things at once: reading other people's orders aloud, and listening through the din for your own codename. For groups who love Spaceteam's panic but want the twist of self-identification under noise.

## Problem
Classic Spaceteam has you search *your own panel* for a named control. That's spatial. Sleeper makes the search *auditory and social*: the hard part isn't finding the switch, it's realizing an order is meant for *you* while three people are talking. That single inversion — addressing by hidden identity — is a fresh, load-bearing use of per-phone privacy.

## How it works
The host TV shows a mission progress bar and a live 'orders completed / orders expired' tally — no order text. Each PLAYER phone PRIVATELY shows: its own CODENAME pinned at the top (e.g. NIGHTJAR), a small panel of 4–5 tappable controls (RED SWITCH, LEVER B, PURGE…), and a streaming queue of order cards it must *announce* — 'To MARLIN: pull LEVER B'. Crucially, the phone that receives an order card to read out does NOT own that control; it must speak it so the real MARLIN — someone else — hears, recognizes their codename, finds the control on their own panel, and taps it before a hidden timer expires.

So every phone is simultaneously an announcer (reading a queue of orders addressed to others) and a sleeper (filtering the room's chatter for its own codename to execute). Orders are pre-routed server-side so each order's target control exists on exactly the addressed player's panel. Missed orders expire; wrong taps buzz. The overload comes from the queue outrunning the room's speaking bandwidth.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale). Data model: `Player{ codename, controls[] }`, `Order{ id, targetCodename, control, issuedAt, ttl }`. The server assigns each player a private codename, deals each player a panel, then generates orders whose `(targetCodename → control)` always resolves to a real panel slot, and pushes order cards to *announcer* queues (never the target's queue). Sync: order issue/expire/complete events broadcast; taps validated server-side against target+control+ttl. No tight simultaneity window needed — the clock is the TTL, not sub-second arbitration — so latency tolerance is generous. The genuinely hard part is *flow tuning*: order issue-rate vs. player count so the room is drowning-but-not-hopeless, plus codenames distinct enough to hear yet easy to confuse under stress.

## v1 scope
- 3 players, one 60s round
- One codename each, 4 controls each
- ~12 orders issued at a fixed cadence
- Host shows completed/expired count and a pass threshold (≥8)

## Out of scope
- ASR onset detection or auto-validation of who spoke
- Codename reassignment, escalating waves, sabotage roles
- Any scoring beyond the completed/expired tally

## Risks & unknowns
- Does codename-filtering feel clever or just frustrating? Needs distinct, punchy codenames.
- Announcer/sleeper dual-role may overload beginners — may need a tutorial round at half rate.
- Without ASR, cheating (peeking at others' screens) is possible; relies on social honesty.

## Done means
3 players clear ≥8 of 12 orders in 60s where every completion required the addressed player to recognize their spoken codename and tap their own control, and no player could act on an order shown only on someone else's phone.
