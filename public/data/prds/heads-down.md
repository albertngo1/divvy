## Overview
A 3–4 player game played over a 90-second clip on the TV. Each phone is a private bookmaker that keeps interrupting you with timed wagers. Attention is the currency: every ticket you read costs you the seconds of footage that would tell you how to price it. For groups who watch things together while half-scrolling anyway.

## Problem
The second screen already exists — everyone in the room is holding one — and it is pure loss. It steals attention and gives back nothing to the group. The itch: make the phone's pull *the game*, and make the conflict adversarial rather than private, so looking down is a decision with a visible cost and the ability to inflict that cost on someone else.

## How it works
Host screen (public): the clip, a chip count per player, nothing else. It deliberately never shows who is looking down — the room can see that with its own eyes.

Each phone (private): dark, one word — WATCH. Then, on a schedule unique to that phone, a TICKET slides up:

> **4:1 — THE MAN IN THE GREY COAT PICKS UP THE PHONE WITHIN THE NEXT 15 SECONDS.** BUY / PASS / PUSH

It stays six seconds. Reading it honestly costs about four seconds of clip.

PUSH costs 2 chips and hands the ticket to a named player. Their phone buzzes hard, shows the ticket for six seconds, and they must BUY or PASS. That is the whole social engine: you spend your own attention to steal theirs, timed at the moment you believe matters.

Ticket schedules are staggered per phone so nobody's blind windows line up. Every ticket carries a hand-annotated truth value and a resolution window, so scoring is automatic.

After the clip, the TV replays the three most-bet moments with a HEADS-DOWN TIMELINE overlaid: exactly who had a card open during each one. Chips from bets, plus a bonus for lowest total heads-down seconds. The optimal player bets rarely and pushes constantly.

## Technical approach
Host browser tab + phone PWAs + PartyKit Durable Object. Model: `tickets[{id, showAtMediaMs, windowMs, text, odds, truth}]`, `assignments{playerId: ticketId[]}`, and the audit trail `cardEvents[{playerId, ticketId, openedAt, closedAt, source: 'schedule'|'push'}]`.

Host tab owns the `<video>` and heartbeats media time; the DO schedules card pops in host-media time and pre-compensates each phone by its measured RTT so a card intended for 0:42.0 lands within ±150ms on every device.

The hard part is measuring heads-down honestly. A card being open is not proof of eyes on glass. Mitigation is design, not sensing: tickets run ~14 words so they cannot be skimmed peripherally, text blanks at six seconds, and `visibilitychange` plus touch events catch the obvious cheats. Accept residual error and make the timeline a claim the room can argue with, not a verdict.

## v1 scope
- 3 players, one 90-second clip, 12 hand-annotated tickets, 4 assigned per player
- BUY / PASS / PUSH, 3 chips of push budget each
- Fixed odds, no stake sizing
- One post-clip heads-down timeline over three replayed moments

## Out of scope
- Auto-annotating clips with vision or an LLM
- Camera-based gaze detection
- Multiple clips, live TV, streaming integrations, chat

## Risks & unknowns
- Annotation labor: roughly 20 minutes of human work per 90 seconds of clip. Kills content scale until automated.
- PUSH may read as pure spite rather than strategy at 3 players; may need a cap or a rebate to the pushed player.
- iOS background throttling of the host tab drifting the whole schedule.
- The game may simply be stressful rather than fun — the failure mode is nobody enjoying either the clip or the phone.

## Done means
Three phones, one 90-second clip: cards land on schedule, a PUSH lands during an annotated key moment, the pushed player demonstrably misses the fact their own ticket resolves on, and the post-clip timeline proves it on the TV to audible complaint.
