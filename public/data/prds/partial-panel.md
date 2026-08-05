## Overview

Partial Panel is a 5-player cockpit game for a TV host screen and five phones. The shared screen shows an aircraft on approach and nothing else useful. The instruments — the only information that exists — are split one per phone. You cannot see anyone's gauge but your own. One gauge is lying, its owner has no idea, and the crew has three decisions before the ground arrives.

For groups who want a co-op that turns traitorous only if someone chooses it.

## Problem

Hidden-traitor co-ops assign the betrayal up front, so the traitor spends the whole game managing a secret. The itch here is the opposite shape: nobody starts as a traitor. Betrayal becomes *available* mid-game, to whoever discovers their own view is the broken one — a private, dawning, deeply uncomfortable realization that the rest of the table cannot see happening.

## How it works

**Host screen (shared):** a side-view approach diagram — runway, glidepath cone, aircraft silhouette — plus a tick counter (TICK 1 OF 3) and the crew's last committed action. Deliberately uninformative about position; it shows the plane, not the truth.

**Each phone (private):** exactly one instrument, assigned at start. Altimeter. Airspeed. Glideslope needle. Fuel. Attitude. Your phone shows your gauge, live, and a text box for your one-line report.

**Per tick (90s):** everyone reads their gauge aloud. The TV transcribes nothing — this is voice, around a table. Then the crew argues and each phone votes on one of three actions: PULL UP, PUSH DOWN, HOLD. Majority commits; the TV animates the plane; every phone's gauge updates from the new true state — except the drifted one, which updates from the true state plus a growing offset.

By tick 2 the drifted player is contradicting four people. Their phone quietly grows a fourth button: **DECLARE UNRELIABLE**. Pressing it converts the round to co-op — the crew flies on four gauges, and if they land, everyone including the declarer scores. Not pressing it is a bid: if the plane crashes, the drifted player scores double and everyone else scores zero. They never have to lie. They only have to keep reading their gauge.

At landing or impact the TV replays all three ticks with all five gauges shown side by side, true values overlaid, so the table can see exactly where the seam was.

One phone passed around is not a degraded version of this game — it is no game. The entire mechanic is five simultaneous private information channels and one of them being wrong.

## Technical approach

PartyKit Durable Object per room; host tab and five phone PWAs as clients. Server owns the flight sim and the truth.

Data model: `Room { code, phase: lobby|read|vote|animate|reveal, tick, state: {altitude, vspeed, airspeed, glideDeviation, fuel}, assignments: {playerId → instrumentId}, driftedPlayerId, driftFn: (tick) → offset, votes: {playerId → action}, declared: playerId|null, history: [snapshot] }`.

Sync: each tick the server computes true state, then emits a *per-socket* payload containing only that player's instrument value — with `offset(tick)` added for `driftedPlayerId`. The drift is monotonic and small at tick 1 (~3% of range) so it reads as "my gauge is a bit off" rather than "my gauge is broken." The `DECLARE UNRELIABLE` button is server-gated: it only appears in the payload from tick 2 onward, and only for the drifted player, so it can't be discovered by inspecting the client bundle.

The hard part is the drift curve, not the transport. Too small and the drifted player never notices, so the traitor branch never fires and it's a mediocre co-op. Too large and they notice at tick 1 with no ambiguity and no dilemma. v1 hardcodes a single flight profile and a single tuned drift curve rather than pretending this can be parameterized before it's been played.

## v1 scope

- One approach. Exactly 3 ticks, then land or crash. Exactly 5 players, 5 fixed instruments.
- One hand-authored flight profile, one drift curve, one drifted instrument chosen at random.
- Host: approach diagram, tick counter, committed action, 90s timer, final replay.
- Phone: one SVG gauge, action vote buttons, conditional DECLARE button.
- Voice reporting only — no typed reports, no transcript, no server-side text.

## Out of scope

Multiple approaches or a campaign. Weather, crosswind, engine failure. Variable player counts. Reconnect. Scoring history. Any real flight physics — a scripted state machine with three branches per tick is enough.

## Risks & unknowns

Three ticks may be too few to build the realization; five may be too many for a 6-minute round. Unknown. Second: a drifted player who declares immediately, every time, kills the whole traitor branch — the incentive gap between declaring (share of a win) and crashing (double, alone) needs to be wide enough to tempt but not so wide it's automatic. Third: gauges must be legible on a phone at a glance and legible enough to *describe out loud* — an attitude indicator is famously hard to verbalize and may need to be cut for a second numeric gauge.

## Done means

Five phones plus a laptop play a full approach end to end. In ten playtest rounds, the drifted player self-identifies before tick 3 in most rounds, presses DECLARE in some but not all of them, and at least one round ends in a crash that the table can trace to a specific tick during the replay.
