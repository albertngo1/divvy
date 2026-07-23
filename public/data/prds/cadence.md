## Overview
A no-talk cooperative synchrony game for 3 players (v1). Everyone swings their phone at whatever steady tempo feels right, blind to the others, and the room wins when all three swing tempos silently lock together. For groups who liked the wordless timing of Shutter or the internal-feel of Dwell and want to bring the whole body into it.

## Problem
Every rhythm-convergence idea so far *hands you a beat* — Clave's grid, Downbeat, Tuning Fork. None asks bodies to FIND a shared tempo from nothing. Rocking in step is primal and a little ridiculous; doing it blind, converging on an unspoken BPM you never agreed to, is a pure synchrony itch nothing in the cloud scratches.

## How it works
On 'go,' everyone gently swings their phone like a pendulum at their own felt tempo. No audio, no visual metronome, no view of anyone else. Each phone's accelerometer detects swing peaks → instantaneous period (ms between swings). The phone shows PRIVATELY only a soft pulse that flares on each detected swing (so you trust your own detection) and nothing about anyone else.

The host TV shows ONE aggregate 'sync bar' — a band whose width equals the spread between fastest and slowest current tempos (wide = ragged, narrows as you align) plus a small 'lock' ring that fills while everyone sits within tolerance. No numbers, no per-player readout. You feel your way in — nudging your swing faster or slower while watching the band tighten. Win when all players' rolling-median periods sit within ~60 ms of each other, held for four consecutive swings.

Per-phone is load-bearing: every phone must be in a hand moving *simultaneously*; the game IS three bodies swinging at once. A passed-around phone is meaningless.

## Technical approach
Host tab + phone PWAs + authoritative WS. Phone reads DeviceMotion (`accelerationIncludingGravity`); detect swings via peak/zero-cross of the dominant-axis magnitude, debounce, emit period samples. Send a rolling median period (last 4) at ~5 Hz. Server tracks each player's period, computes spread = max−min of medians, checks lock (all pairwise ≤60 ms) with a four-swing hold counter, and broadcasts spread + lock to the host only. Hard part: reliable swing detection across phone sizes/grips and gravity noise (per-device peak calibration + debounce), and deriving a stable 'period' from messy accel so the sync bar isn't jittery. iOS requires a DeviceMotion permission gesture.

## v1 scope
- 3 players, one open 60s round
- Accelerometer swing detection + private pulse
- Host sync bar + lock ring
- ±60 ms / 4-swing win
- Single room

## Out of scope
Audio payoff, tempo targets, scoring, gyro fusion, >3 players, calibration UI beyond a 3-swing warmup.

## Risks & unknowns
Flaky accel detection → false periods → unwinnable or cheap. Players may just chase the bar into oscillation (mitigate with slow-updating median + generous hold). Comfort/safety of flailing phones — wrist straps advisable (and a good joke).

## Done means
Three phones swung simultaneously; the host sync bar narrows with alignment; when all three rolling-median periods stay within 60 ms for four swings the host fires a lock/win, and desynced swinging never triggers it.
