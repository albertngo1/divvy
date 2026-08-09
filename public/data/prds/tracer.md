## Overview

One 60-second round, three players, no talking. A playhead sweeps a bar on the TV. Each player must land their **live tap** so all three land within 2.5 seconds of each other. The catch: your phone only accepts taps inside a private window of the timeline, and you don't know anyone else's.

The only communication channel in the game is *time itself* — you get one **tracer** tap, which fires publicly and anonymously the instant you make it.

## Problem

Every silent-sync game so far is a reaction test: match the beat, match the color, hit the frame. None of them make the *act of signalling* cost you the thing you're signalling about. Here, telling the room where you can act uses up the runway you needed to act.

## How it works

The server deals each phone a contiguous **window** — roughly 34 seconds of the 60, generated so the three-way intersection is a genuine 6–10s sliver and no window contains another. A: 0–34s. B: 18–52s. C: 26–60s. Intersection: 26–34s. Nobody knows this.

You hold two marks: TRACER and LIVE. Both are placed by tapping **at the moment you want them**, in real time — you cannot schedule ahead, so every signal costs elapsed clock.

**Privately, your phone shows**: your own window as a lit band on the timeline, the sweeping playhead, your tracer mark once spent, and a red edge creeping toward you as your window's end approaches. Taps outside your window are rejected with a buzz only you feel.

**The TV shows**: one bar, the playhead, anonymous white ticks as tracers fire, and "TRACERS 2/3". Live marks stay invisible until the reveal.

The drama is structural. The player whose window closes first has to speak first or lose everything, and does so before learning anything. The player whose window opens last is tempted to wait and free-ride — and if everyone waits, the early player's runway is gone and the room is mathematically dead while the bar is still sweeping. Someone has to volunteer to be the beacon, in silence, with no idea they're the one who should.

## Technical approach

PartyKit / Durable Object per room. State: `{t0, windows: {pid: [startMs, endMs]}, tracer: {pid: ms|null}, live: {pid: ms|null}}`.

Clients timestamp taps locally with `performance.now()` and send with an offset established by a 5-sample ping/pong handshake at join; the server converts to room-time and is the sole authority on window validity and win condition. The 2.5s tolerance means ±150ms of skew is survivable — but the **tracer tick must reach the TV in under 250ms or the signal is misread**, which is the real engineering bar.

The other genuine hazard: a backgrounded PWA loses `requestAnimationFrame` and the phone's playhead silently drifts, so the player is tapping against a lie. Drive the local playhead from a Web Audio clock or a Worker timer, and re-anchor to server room-time every 2 seconds.

Window generator: four hand-tuned sets, rotated, all with a non-empty triple intersection and asymmetric closing order.

## v1 scope

- Exactly 3 players, exactly one 60-second round
- One tracer + one live mark each; 2.5s win tolerance; hard fail otherwise
- Four hardcoded window sets
- Reveal screen: three live marks plotted on the bar with the true windows drawn behind them

## Out of scope

- Multiple rounds, scoring, 4+ players, variable round length, difficulty curve
- Audio cues on the phone (the room must stay silent), haptics beyond reject-buzz
- Reconnect mid-round — a dropped phone loses the round

## Risks & unknowns

- 2.5s may be far too generous or far too tight; needs a live tuning pass with real humans
- Players may not intuit that the tracer is *information* rather than a practice swing — the pre-round card has to teach that in one line
- Degenerate solution: everyone taps at 30s. Mitigate by generating at least one window set whose intersection excludes the midpoint

## Done means

Three people, three phones, one laptop, silence enforced: a room that has never played wins inside five attempts, and someone says out loud afterward "I fired early because I was about to run out" — that sentence is the whole design working.
