## Overview

Eyes Up is a watch-along betting game for 4-6 friends and one 5-minute clip. The host tab plays video; every phone is a private prop-bet terminal that is **dark by default** and only renders while a thumb is held on a reveal pad. Looking at your money means not looking at the show. The game is the trade-off.

## Problem

Ambient second-screen betting layers make phone-glancing free, so they just add another passive stream to a room already half-watching. Nothing in a group TV night is *scarce*. Attention is the only real currency at a watch party, and no game has ever charged for it. Meanwhile everyone at the couch is already an unreliable witness — "wait, did he take the glass?" — and that disagreement is unmonetized.

## How it works

1. Host loads the bundled clip; players join by room code.
2. Pre-roll: each phone privately receives **3 prop cards** drawn from a 12-prop pool, dealt so no two players share a prop. Props are objective and scripted: "a character says a number out loud", "the door opens twice", "the red mug is still on the table after the cut".
3. Each prop's YES price rises linearly from 20 to 80 over the clip. Early is cheap and blind; late is informed and expensive.
4. During playback the phone shows nothing. Hold the reveal pad → your 3 props, live prices, and your positions appear. Tap a prop while holding to lock a 10-chip stake at the current price. Release → dark.
5. The TV shows the clip plus an **anonymized tape**: a timeline marker every time *someone* locks a bet, no name, no prop. A cluster of buys 4 seconds after the door opened is public information — if you saw the door.
6. Talking is legal and is the point. You want other people's eyes, but every question you ask ("how many times did that door open?") leaks your position to a room that can front-run the price curve.
7. Settle: the host resolves all props from the authored timeline. Correct YES pays stake × (100 − lock price) / 50; wrong loses the stake.

**Private per phone:** your 3 props, prices, positions, P&L, reveal-time budget. **Shared on TV:** the clip, the anonymized bet tape, final chip counts.

## Technical approach

PartyKit Durable Object (or Socket.IO over Tailscale Serve) as the authoritative room. Host is clock master, broadcasting `tick {clipMs}` at 4 Hz read from `<video>.currentTime`; phones interpolate prices locally, so no per-frame traffic.

Data model: `Room{code, phase, clipId, clipMs, tape[]}`, `Player{id, name, props[3], orders[], chips, revealMsUsed}`, `Prop{id, text, resolveMs, truth}`, `Order{playerId, propId, clipMs, price}`.

The genuinely hard part is **latency-honest pricing**. A phone with 300 ms RTT must not buy at a stale, cheap price after seeing the event land on the TV. Fix: price off server-authoritative `clipMs` (last tick + server elapsed), reject orders whose client-claimed clipMs deviates by more than 500 ms, and apply a uniform 750 ms order delay to everyone so RTT differences never decide a winner. Second hard part: "is the phone being looked at" — v1 uses hold-to-reveal touch plus the Page Visibility API rather than camera gaze, which is honest enough and needs zero permissions.

## v1 scope

- One bundled 5-minute clip with a hand-authored 12-prop timeline JSON
- 4 players, 3 disjoint props each, single fixed 10-chip stake, YES only
- Linear price curve, no order book, no selling out of a position
- Anonymized tape on TV; per-player 45 s reveal budget shown as an anonymous bar
- Room-code join, no accounts, one round, leaderboard, done

## Out of scope

User-supplied clips or Netflix/Plex sync; camera-based gaze detection; a real order book or CFMM; NO side; multi-round seasons; LLM auto-generation of props from video; spectators; audio props.

## Risks & unknowns

Authoring props per clip is manual and does not scale — the content pipeline, not the netcode, is the product risk. Players may simply hold the pad the entire time and ignore the TV, collapsing the tension; the reveal budget is an untested mitigation. Four players may generate too sparse a tape to be informative. Clip licensing pushes v1 toward public-domain or CC footage.

## Done means

Four phones join by code; the clip plays; every player locks at least one bet; all props auto-resolve within 2 s of clip end; the TV shows correct final chip counts; no phone renders a price without a held thumb; and a replay of the server log confirms no accepted order was more than 500 ms off server clip time.
