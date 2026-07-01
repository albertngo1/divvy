## Overview
Cutaway is a browser app that turns your actual car's engine telemetry into a live, gorgeous cross-section animation — the kind Bartosz Ciechanowski hand-builds, but driven by *your* engine instead of a scripted demo. For gearheads, commuters, and anyone who's ever wondered what's happening under the hood while they drive.

## Problem
Ciechanowski's Internal Combustion Engine explorable is mesmerizing but frozen — it animates an idealized engine, not the one you're sitting in. Meanwhile every modern car exposes rich real-time data over OBD-II that owners never see beyond a check-engine light. Nobody has married the two: a beautiful explorable *fed by live reality*.

## How it works
A cheap ELM327 Bluetooth OBD-II dongle plugs into the car's port. The web app connects via Web Bluetooth, polls PIDs (engine RPM 010C, throttle 0111, intake temp, MAF, coolant temp) at ~10 Hz, and maps them onto a 4-stroke inline-4 SVG/canvas cutaway. Pistons rise and fall at true crank speed; the firing order 1-3-4-2 lights intake/compression/power/exhaust strokes in color; throttle plate opens with your foot; the tachometer needle is real. Idle rough? You see the pistons stutter. Redline? The whole thing blurs. A "ghost" mode replays a saved drive.

## Technical approach
Stack: vanilla TS + Web Bluetooth API + a canvas 2D or WebGL2 renderer. The engine geometry is parametric (bore, stroke, rod length → piston position via crank-slider kinematics: y = r·cos θ + √(l² − r²·sin²θ)). RPM drives a phase accumulator; a fixed-timestep render loop (requestAnimationFrame) interpolates between the ~10 Hz PID samples so motion stays smooth. ELM327 talks AT commands over an RFCOMM serial-over-BLE characteristic; parse hex responses per SAE J1979. The genuinely hard part is latency and jitter: OBD polling is slow and irregular, so you must predict crank angle forward from the last RPM sample and reconcile on each new reading without visible jumps.

## v1 scope
- Connect to ELM327 over Web Bluetooth
- Poll RPM + throttle only
- One hard-coded inline-4 cutaway, animated to live RPM
- A tachometer readout for sanity-checking sync

## Out of scope
- Multiple engine layouts (V6, boxer)
- Turbo/boost, valve timing detail
- Trip recording/replay, sharing
- iOS (Web Bluetooth is Chrome/Android/desktop only)

## Risks & unknowns
ELM327 clones vary wildly in poll speed; some cap at 3-5 Hz, making smooth animation harder. Web Bluetooth on iOS Safari is absent — need a native shim or Android/desktop-first. Reading PIDs while driving raises a real safety/legal caution (passenger-only use). Crank-angle prediction may drift on sudden throttle blips.

## Done means
With the dongle in a running car, revving the engine visibly speeds the on-screen pistons within ~200 ms, the firing sequence is correct, and the animation stays smooth (no teleporting pistons) across an idle-to-3000-RPM sweep.
