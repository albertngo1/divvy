## Overview

Reads High is a 4-player, single-round hidden-role game for a room with one TV and four phones. The room is commissioning an absurd machine and must file one honest report of six gauge readings before the clock runs out. Three players read the machine correctly. One phone is silently miscalibrated: its gauges show real measurements pushed through a hidden affine transform. That player is told they are the Odd One. They are *not* told the conversion.

## Problem

Hidden-role games usually hand the imposter a lie to tell, so the game degenerates into a performance contest — the most theatrical liar wins and the quiet player gets voted out for being quiet. The "imposter just has less info" variant fails the other way: three innocents with a shared public board simply out-vote the one odd view in ninety seconds. Reads High gives the imposter information that is *true but in the wrong frame*, and gives every innocent an incomplete, overlapping slice, so nobody can prove anything alone and the imposter's defense is sincere.

## How it works

Six gauges (BOILER, SLACK, DRIFT, PURGE, TARE, HEADROOM). Each player is privately dealt two. Four players × two slots over six gauges means exactly two gauges are held by two players — and nobody is told which. All six values drift on a slow server-side random walk, so any quoted number goes stale in about twenty seconds and has to be re-said.

**Privately, on your phone:** your two gauge names and their live numbers, rendered huge. That is the entire private UI. The Odd One's phone is pixel-identical in layout and unit labels, but each reading is `a·x + b` for a hidden `(a, b)` drawn from a small table (1.8/+32, 0.9/−4, 1.25/+11).

**Publicly, on the TV:** the six gauge names, each one's target green band, a five-minute clock, and an empty six-field Report. Any player can propose a number into a field from their phone; a field locks when a second player confirms it.

Speech is the only channel between phones. The room discovers the duplicate gauges by shouting values and hearing agreement — and hearing exactly one person disagree. The Odd One must infer their transform from overheard numbers and re-quote themselves into the room's frame, live, without visibly doing arithmetic. Near the crossover `x = b/(1−a)` the two scales agree, so one lucky gauge hands them free cover and a genuine alibi.

When the Report locks or the clock expires: one simultaneous private vote. Innocents win only if they vote out the Odd One **and** the filed report is within tolerance of truth — so stonewalling the odd numbers loses too. The Odd One wins by surviving.

## Technical approach

PartyKit Durable Object per room (fallback: Socket.IO over Tailscale Serve). Server state: `truth[6]` floats, `assignment: playerId → [gaugeIdx, gaugeIdx]`, `oddOne: playerId`, `transform: {a, b}`, `report[6]`, `votes`. A 4 Hz tick advances each truth value by a bounded Gaussian step and pushes each player a per-socket projection — the imposter's client never receives untransformed values, so the cheat surface is a screenshot of someone else's phone, not devtools.

Sync is easy (four clients, tiny payloads, verbal latency dominates). The genuinely hard part is **parameter tuning**: `(a, b)` must keep transformed readings inside plausible display range for the whole drift window, or the Odd One is caught by an obviously absurd number in round one. Transform selection is therefore constrained against the truth band at deal time, and the drift walk is clamped.

## v1 scope

- Exactly 4 players, one 5-minute round, one vote.
- Six gauges, fixed names, fixed target bands.
- One transform table of three entries.
- Host screen: gauges, bands, clock, Report, result card.
- Phone: two numbers, a propose-value field, a confirm button, a vote screen.

## Out of scope

Multiple rounds, scoring across games, 5–8 player scaling, non-affine distortions (noise, lag, sign flip), any audio processing, rejoin/reconnect polish, tutorial.

## Risks & unknowns

Mental arithmetic under social pressure may be flatly unfun for some players — mitigate by keeping `a` to one decimal and numbers two-digit. The duplicate-gauge discovery may be too slow to bootstrap; if playtests stall, the TV can name one duplicate pair at t=90s. Innocents may accidentally play perfectly by never comparing, ending in a coin-flip vote.

## Done means

Four phones join by room code; each shows two live drifting numbers. Exactly one phone's numbers are transformed and that player sees an "You are the Odd One — your panel is wrong somehow" card. A full round can be played to a locked Report and a vote, and the result card correctly shows the transform, the true values, and whether the innocents hit both win conditions. Three consecutive playtests where at least one round is won by the Odd One *and* at least one is won by the room.
