## Overview

**In the Way** is a 60-second standing-room party game for 4 people with phones. Each phone continuously emits an inaudible ~19kHz carrier on its own frequency and simultaneously measures how loudly it receives everyone else's. Because a human torso is enormous compared to a 18mm wavelength, ultrasound casts a genuine acoustic shadow — so *your body is a wall*, and the living room becomes a board of sightlines you can't see. For groups who already own a TV and are bored of typing jokes into phones.

## Problem

Sensor party games almost always reduce to "shake it" or "point it." Nobody has made the room's geometry the actual game state. And the best social-deduction beat — *everyone can see something is going wrong, nobody knows who's causing it* — is usually simulated with lying. Here it's physically real.

## How it works

Everyone holds their phone flat against their chest, screen facing out, and stands anywhere in the room. Six pairwise links exist between 4 players. The host TV shows all six as live bars: **CASEY↔DEVIN**, **AMY↔BEN**, etc., each bar rising and falling in real time as bodies move.

Each phone privately shows exactly one secret assignment:

- **SCREEN: Casey ↔ Devin** — drive that pair's link *below* the threshold. You are not in that pair.
- **HOLD: you ↔ Ben** — keep your own link to Ben *above* threshold.

Critically, a screener's phone cannot measure the pair it's attacking; it only measures its own reception of Casey and of Devin. The learnable physical inference is the whole game: when you hear *both* of them loudly and equally, you are on the line between them, and your ribcage is doing the rest. Meanwhile Casey watches their own bar drown on the TV, has no idea who's doing it, and starts side-stepping to find a clear path — which the screener must track and re-block, live.

Score at 60s: screeners win if their pair sat below threshold for ≥30 cumulative seconds; holders win if theirs stayed above for ≥45. Then the TV reveals every assignment, which is when the shoving starts making sense.

One shared phone cannot produce this. Four simultaneous emitters, four private 3-channel receivers, four conflicting secret goals.

## Technical approach

Phone PWA + host browser tab + authoritative WS server (PartyKit / Durable Object).

- Server assigns carriers at join: 18.2 / 18.6 / 19.0 / 19.4 kHz. `OscillatorNode` → gain 1.0.
- Receive: `getUserMedia` with `echoCancellation:false, autoGainControl:false, noiseSuppression:false` (non-negotiable — AGC annihilates the carriers). `AnalyserNode`, fftSize 4096 @48kHz → 11.7Hz bins, carriers 400Hz apart, no bleed.
- Own-carrier swamping is solved with TDMA: a 600ms frame of four 150ms emit slots. Each phone emits in its slot and measures the other three. This needs cross-phone clock alignment to ~10ms, done with NTP-style offset estimation over WS ping/pong plus a slow drift correction.
- Data model: `Room{players[], carriers, assignments[], frameEpoch}`; each phone posts `{rx:{pid:dBFS}}` at 5Hz; server keeps `link[a][b] = mean(rx_a→b, rx_b→a)`, EMA over 600ms, and owns all thresholding.
- Hard part: **calibration.** Absolute dBFS is meaningless across devices. Fix with a 5-second lobby step — "everyone stand in a circle facing in" — recording per-pair baseline, then scoring on dB *deficit from baseline*, not raw level.

## v1 scope

- Exactly 4 players, one 60-second round, one room.
- Two assignment types only: SCREEN-a-pair, HOLD-your-own.
- Host TV: six labelled bars + a countdown. Nothing else.
- No accounts, no avatars, no sound design, no rematch button.

## Out of scope

More than 4 players (carrier crowding), teams, multi-round scoring, mid-round assignment swaps, any use of distance as a coordinate, phones in pockets.

## Risks & unknowns

- Shadow depth may be only 4–8dB in a reverberant room; hard walls fill the shadow with reflections. Mitigation: score on relative deficit, tune threshold live during playtest, prefer a rug/curtains room.
- 19kHz is audible to some teenagers and most dogs. Warn in the lobby.
- Android mic AGC sometimes ignores the constraint flags.
- iOS backgrounds audio when the screen locks — require phone-in-hand, screen on.

## Done means

Four phones in one room, one round: the TV's six bars visibly track real body movement (a person deliberately stepping between two others drops that bar ≥5dB below baseline within 1s and it recovers within 1s when they step away), scoring resolves at 60s, and in blind playtest at least one screener wins without their victim guessing who it was.
