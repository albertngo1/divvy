## Overview

A 4-player co-op of pure restraint. A sweep line crosses the TV once, over 40 seconds. Hidden along it are seven marks. When the sweep crosses a mark, *somebody* must make a noise within ±250 ms. Only one player can see each mark. And every player holds a **secret, tiny ration of noise** — and speech spends it from exactly the same pouch.

## Problem

"Stay quiet" is a rule, not a mechanic — rules get self-policed and argued about. Powder Dry makes silence the *currency* rather than the constraint: your voice is ammunition, and the meta-recursive trap is that coordinating the budget costs the budget. It's the smallest possible game where saying "you take the third one" is a strictly quantifiable mistake.

## How it works

**Host TV:** a wide dark band and a sweep line traveling left to right, one pass, 40 s. Marks are invisible until struck. A hit lights green at that position; a miss burns red; a shot fired nowhere near a mark leaves a small white scar with your color. A shared HIT/MISS counter.

**Each phone, privately:** a miniature of the same band showing **only your own marks** (each player owns 1–3 of the seven), and your **ration** — a row of 1–4 pips, dealt secretly and never revealed. Nobody knows the room's total budget, which is deliberately just barely enough.

Spending: your phone charges **one pip per 500 ms of voiced audio, rounded up**. A crisp clap or "HUP" costs 1. The sentence "mine's the one right after yours" costs 4 — a whole ration, possibly the entire round. When your pips hit zero your phone greys out; you are mute cargo for the rest of the sweep.

So the player who owns three marks but was dealt two pips has a real problem, solvable only by *spending* to describe a mark to someone richer — a trade that may or may not pay. Everyone learns, fast, to point at the TV and grunt.

One round. Seven marks. The room hits them all or it doesn't.

## Technical approach

Authoritative Durable Object holds `{sweepStartAtServerMs, marks[{posMs, ownerId}], rations{playerId→pips}, shots[]}`. The TV is a dumb renderer driven by server time.

Each phone runs a Web Audio `AnalyserNode` at ~10 ms hop, detects onset by RMS crossing an adaptive per-device noise floor (calibrated during a 5 s lobby hush), and reports `{onsetLocalMs, rms, durationMs}`.

Two hard parts. **(1) Sub-250 ms timing across heterogeneous phones.** Local `AudioContext.currentTime` is mapped to server time by continuous WebSocket ping-pong with a Kalman-ish offset/skew estimate; only the offset-corrected onset is trusted, never message arrival time. **(2) Attribution under cross-talk.** One shout is heard by all four phones; within a 120 ms window the server awards the shot to the highest-RMS, earliest-onset claimant and discards the rest, so only the near-field owner is charged a pip.

## v1 scope

- One 40-second sweep. Exactly four players.
- Seven marks, hand-placed, ≥1.5 s apart. Rations dealt from [1,2,3,4] summing to 9.
- Onset detection only — no pitch, no ASR, no distinguishing a word from a clap.
- Lobby hush calibration; no reconnect, no rematch.

## Out of scope

Multiple sweeps, difficulty curve, generated mark layouts, moving/overlapping marks, spectators, any per-player scoring beyond the shared HIT count.

## Risks & unknowns

±250 ms may be unachievable on cheap Android audio stacks — the window may need to open to 400 ms, which softens the tension. Charging speech by duration might feel arbitrary until players internalize it; the pip meter must drain visibly *while* you talk to teach it in one round. Biggest design risk: the room may simply refuse to talk at all and the social layer never fires — mitigated by making the ration distribution lopsided enough that silence provably fails.

## Done means

Four phones, one sweep: every noise is charged to exactly one player, pip meters drain in real time, hits register within the window ≥85% of the time on mixed hardware, and at least one playtester audibly starts a sentence and stops it after one syllable to save a pip.
