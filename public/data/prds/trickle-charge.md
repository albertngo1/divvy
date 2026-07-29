## Overview
A 4-player, one-round, ~2-minute greed game. One battery on the TV charges while the room is quiet. Each player holds a private minimum they must reach before they're allowed to cash it, and cashing pays less for everyone who cashes after. For 3–5 people who enjoy a standoff where the winning move is to want something badly and not be able to say so.

## Problem
Silence games are usually cooperative — the room is on one side, the mic on the other. That's warm but toothless. This one puts the mic *between* players: silence is a commons that some people need more of than others, and noise is a weapon with a receipt attached. Nobody can even lobby for what they need, because lobbying is the thing that destroys it.

## How it works
**Publicly, on the TV:** one charge meter (0–100), rising at 4/s while every phone reports below its floor, falling at 12/s the instant any phone hears voicing. A row of player lamps: HOLDING or CASHED-at-N. A 2:00 clock.
**Privately, per phone:** your ARM level (dealt from {20, 35, 55, 80} — one per player, secret) and a single giant CASH button, dead and greyed until the meter reaches your arm. Your payout = current meter × (1.0, 0.7, 0.5, 0.35) by cash order. So arm-20 can bank early and cheap; arm-80 needs almost two minutes of unbroken room silence to be paid at all — and cannot ask for it.
**The weapon:** clear your throat, cough, say one word. The meter dumps. But your own phone attributes it (it heard it loudest and earliest), and the penalty is not points — your phone *publishes your ARM level to the TV* and locks your CASH button for 15 seconds. Sabotage works, and it tells everyone exactly why you did it. Round ends when all four have cashed or the clock runs out; uncashed = zero.

## Technical approach
Host tab + phone PWAs + Socket.IO over Tailscale Serve, server authoritative. Phones stream `{id, dbfs, onsetTs, seq}` at 20 Hz; the server integrates the meter on its own tick so a laggy phone can't fabricate charge. State: `{meter, tick, players: {id, arm, cashedAt, payout, lockUntil}}`.
The genuinely hard part is attribution across four mics in one small room — everyone hears the cough. Approach: per-device gain calibration from a TV reference tone at join, then blame the phone with the *earliest* onset timestamp (clock-synced via NTP-style round-trip offset) and, as a tiebreak within a 12 ms window, the highest calibrated level. Simultaneous voicing from two people blames both. Voicing (not clatter) is gated on a crude periodicity check so a dropped fork doesn't cost anyone their secret.

## v1 scope
- 4 players, one round, fixed arm set {20, 35, 55, 80}, fixed decay ladder
- 2:00 hard clock, single meter, no rematch
- Attribution = earliest onset with level tiebreak; no beamforming
- Host screen: meter, four lamps, clock. That's all.

## Out of scope
Multi-round series, dynamic arm dealing, whisper allowances, spectators, reconnect, animations beyond the meter.

## Risks & unknowns
If attribution misfires, the punished player is doubly wronged — their secret leaks for someone else's cough — so the false-positive rate has to be low or the game is poison. Arm-80 may be structurally unwinnable, which is fine as a tragic role but bad if it's always the same seat; needs playtesting on whether early cashers just farm it. A very noisy room means nothing ever charges and the round is a dud.

## Done means
Four phones calibrate and join. The TV meter visibly climbs in silence and dumps on a spoken word within 300 ms. A deliberate cough from a chosen player publishes that player's arm level on the TV — correctly — in at least 8 of 10 trials, and locks only their button. One playtest ends with a player who cashed at 30 for full value beating a player who held for 80 and got nothing.
