## Overview
A 4-player hidden-role game for a living room with a TV and four phones. Everyone cooperates on one small timed build. Three players' countdowns tick at real speed. One player's countdown — chosen at random, never disclosed — runs at 1.35x or 0.72x. Everyone sees the same task, the same board, the same words. The only altered private view is the passage of time.

## Problem
Hidden-role games hide *facts*: a word, a role card, a picture. Deduction collapses into cross-examining content, and the imposter's job reduces to lying about things. That leaves an entire social channel unplayed — tempo. Real suspicion in a room is often about pace: the person who won't stop hurrying everyone, the one who is weirdly unbothered while the group panics. Nobody has built a game where the hidden difference is *rate*.

## How it works
**Host TV (public):** a six-slot KIT for a scenario ("48 hours, desert, one duffel"). Filled slots show the item and who claimed it. A public log announces lock-outs. **There is no clock anywhere on the TV.**

**Each phone (private):** (a) an unlabeled draining bar — no numbers, no tick marks; (b) a CLAIM control: pick an empty slot, type up to three words, submit — you may not claim twice in a row, so every slot must be negotiated aloud; (c) a one-shot CHECK YOUR WATCH toggle.

When your bar empties, your phone hard-locks and the TV announces "MARCUS is out of time." The group scores only if all six slots are filled before the last phone locks — so stalling loses, and rushing burns slots on junk. Crucially, each player's nominal budget is randomized +/-15%, so lock *order* is noisy and proves nothing. Only felt rate is signal. The skewed player experiences a room that is inexplicably calm (or frantic) and must decide whether the room is wrong or they are.

Endgame: every phone privately names one player as the broken clock and privately flips CHECK YOUR WATCH if they think it is themselves. The TV reveals everything at once. Honest players score for a correct accusation; the skewed player scores double for self-calling, and scores for surviving undetected.

## Technical approach
Room state in a PartyKit Durable Object (or Socket.IO over Tailscale Serve): `{players[], budgets{}, deadlines{pid: epochMs}, skewPid, skewFactor, kit[6], phase}`. Skew is baked in once, server-side, at deadline computation — clients are never sent a rate or a duration.

Sync: phones estimate clock offset via min-RTT ping/pong at join. The server pushes only `fractionRemaining` (0..1) at 4 Hz; the phone eases between samples with requestAnimationFrame so the bar stays smooth on flaky wifi. No absolute seconds, deadlines, or budgets ever cross the wire — devtools reveal a float and nothing else.

The genuinely hard part is making the bar honest enough to *feel* but useless to reverse-engineer. A player with a stopwatch could time two fraction samples and derive their rate. Mitigation: a server-seeded per-player non-linear easing envelope, so fraction-to-wall-clock is not affine and two samples do not yield a rate. Lock-out ordering must also be authoritative and race-free — two phones expiring within 50ms cannot both claim the last slot.

## v1 scope
- Exactly 4 players. One round. One hand-authored scenario, one six-slot kit.
- One skewed player; sign picked at random from {1.35x, 0.72x}.
- Base budget 120s, randomized +/-15%.
- Accusation + self-call, one reveal screen, no persistent scoring.

## Out of scope
Multiple rounds, 5+ players, LLM judging of item quality, reconnection, spectators, tuning the skew mid-game, sound design.

## Risks & unknowns
- Calibration is everything: 1.2x may be imperceptible, 1.6x instantly obvious. Needs live playtesting.
- Under conversation load, humans may perceive elapsed time so poorly that the round becomes a coin flip.
- One dominant talker flattens everyone's tempo and erases the signal.
- Stopwatch cheating; also a player simply narrating their bar aloud.

## Done means
Four phones join a room from a code on the TV. One round runs end to end: kit fills through spoken negotiation, phones lock out in a noisy order, all four accusations and self-calls resolve on one reveal screen. In blind playtests with 5 groups, honest players identify the skewed player above chance (>25%) but below 70%, and at least one group argues about it afterward.
