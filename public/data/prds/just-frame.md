## Overview
A 4-player co-op party game that steals the one thing fighting games have that nothing else does: **frame data**. The room collectively performs a four-hit combo. The TV is the fighter; each phone is one link in the chain, holding private timing and private state rules. For groups who have never touched Street Fighter but understand "you were late."

## Problem
Combo execution is the most satisfying skill in games and the least shareable — it lives entirely in one person's thumbs. Meanwhile party games that involve timing collapse into a shared metronome everyone can hear. There is no party game where the beat is *different for every player and invisible to everyone else*.

## How it works
**Deal.** Six move cards go up on the TV by name only (Crouching Heavy, Launcher, Spike...). Each phone is privately dealt one of them with two facts nobody else can see:
- **Link Feel** — one of IMMEDIATE / SHORT / LATE / VERY LATE, backed by a hidden window measured from the previous hit (0.10–0.30s / 0.35–0.60s / 0.65–0.95s / 1.00–1.40s). You are never shown the numbers.
- **State Rule** — what your move requires coming in and produces going out ("only links on a LAUNCHED opponent → leaves them GROUNDED").

**Draft (90s).** Everyone talks. Each phone taps a slot 1–4; the TV shows the proposed order and collisions live, never the private facts. Two of the six moves are red herrings that can't legally sit anywhere — the room must find the chain that state-matches end to end using only English ("I need them in the air, and I put them down").

**Run.** The TV throws hit 1 automatically, then flashes white on every connect. When the flash fires, the player in the next slot must tap their HIT button inside their private window. Early = whiff. Late = opponent recovers. Either way the combo drops and the TV posts the autopsy: **"ALBERT — 180ms LATE."** Only after a drop does that player learn their true numbers. Three attempts; 4/4 triggers the finisher.

Private: your window, your state rule, your error before it's published. Public: the order, the combo counter, the flash, the blame.

## Technical approach
Host tab + phone PWAs + one PartyKit Durable Object per room. Model: `Room{code, phase, attempt}`, `Move{id, name, windowMs:[lo,hi], inState, outState}`, `Attempt{order[], events[]}`.

The hard part is timing fairness. Phones run an NTP-style handshake every 2s (`offset = ((t1−t0)+(t2−t3))/2`) against the DO clock. The server does not emit "flash now" — it emits "flash at server-time T", scheduled ~120ms ahead, so all clients render the same instant. Taps are stamped with `performance.now()` + offset and judged against T, never against packet arrival. A one-shot calibration round (tap on the flash, three times) measures each device's render+touch latency and subtracts it. Windows are ≥200ms wide so 25ms of jitter is comedy, not injustice.

## v1 scope
- Exactly 4 players, one 4-hit combo, one 6-move deck
- 3 attempts, then a score screen. No rounds, no meter, no opponent AI
- TV is a color-flash rectangle and a combo counter — no sprites
- Room code join, no accounts, no reconnect logic

## Out of scope
PvP, multi-round matches, more than four links, difficulty tiers, real character art, spectators.

## Risks & unknowns
The state-matching puzzle may fall in 20 seconds — tune with more herrings. "VERY LATE" may read as too vague to act on, producing frustration rather than laughter. Cheap Android touch latency could exceed the calibration's ability to correct.

## Done means
Four phones and a TV: the room finds a legal order and lands 4/4 at least once across three attempts in live playtest, and every drop is attributed to the correct player with an error figure within ±40ms of a scripted bot client's known ground truth.
