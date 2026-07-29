## Overview

Bench Depth is a macOS menubar toy that reads per-core frequency, residency, and thermal-pressure telemetry and renders it as an eight-oar rowing shell gliding across a strip of water in your menubar (and a larger detail window). Each core is a rower. Boost clock is stroke rate, residency in C-states is how deep the blade sits, and thermal throttling is a rower visibly catching a crab and falling out of time. It's for developers who want ambient, glanceable awareness of what their machine is actually doing under a long build — not a number, a feeling.

## Problem

Everyone has a CPU graph. Nobody reads it. A stack of jittering bars tells you *utilization*, which is the least interesting fact about a modern laptop — the interesting facts are: are we boosting or are we thermally pinned? Are we running on efficiency cores because the scheduler thinks we're idle? Did the fan ramp actually recover the clock? Those live in `powermetrics` and IOReport, and they are invisible unless you go looking. A toy that makes throttling *look wrong* gets noticed peripherally in a way a line chart never does.

## How it works

A sampling daemon polls per-core telemetry at 2 Hz. Each sample maps to a rower's state:

- **Stroke rate** = core frequency normalized against that core's max boost. All rowers pull at the same *nominal* cadence — the coxswain sets it from the package's target clock.
- **Phase error** = how far a core's actual frequency lags its cluster's mean. A lagging core's blade enters late; the shell yaws visibly.
- **Benched** = a core parked in a deep idle state, oar shipped and lying flat.
- **Crab** = a throttle event (thermal pressure transitions to `heavy`), rendered as a rower's blade dragging and the shell shuddering.
- **Boat speed** = aggregate useful work; the water scrolls faster.

P-cores and E-cores are two different crews in the same shell — E-cores are the smaller rowers up front, which makes cluster migration legible as work visibly shifting toward the bow.

## Technical approach

Swift + AppKit menubar agent, Metal or Core Animation for the strip render (menubar art is ~22pt tall, so the detail window carries the real animation).

Telemetry: the clean path is IOReport (`IOReportCreateSubscription` over the `CPU Stats` / `Energy Model` channel groups) to get per-core residency and frequency histograms without spawning `powermetrics` as root. Thermal pressure comes free from `NSProcessInfo.thermalState` and `ProcessInfo.processInfo.isLowPowerModeEnabled`. Fallback path shells out to `powermetrics --samplers cpu_power -i 500 -f plist` with a sudoers entry, for machines where IOReport channel names shift.

Data model: a ring buffer of `Sample { timestamp, [CoreState{ freqHz, residency[cstate], clusterID }], thermalState }`, ~120s deep.

The animation core is a phase oscillator per rower: `θ_i += 2π · f_i(t) · dt`, with a weak coupling term pulling each toward the crew mean so the boat *wants* to be in time and throttling visibly fights that. Blade position is a parametric catch/drive/finish curve keyed on θ.

**Hard part:** IOReport is undocumented and the channel/subgroup names differ across Apple silicon generations (M1 vs M3 vs M4 cluster topology, and per-core frequency is reported as a residency histogram over DVFS states, not a scalar — you must compute the expected frequency as a residency-weighted mean of the state table read from the device tree at `IODeviceTree:/cpus`). Getting that right on hardware you don't own is the whole risk.

## v1 scope

- Apple silicon only, single P-cluster + single E-cluster assumed.
- Menubar strip: shell + oars + water, 30fps, no detail window.
- Frequency-driven stroke rate and benched-core oar shipping. That's it.
- Throttle events flash the shell red for 2s.
- Hardcoded DVFS state table for M-series, read from device tree with a fallback constant.

## Out of scope

- Intel Macs, Linux, Windows.
- GPU/ANE telemetry (tempting: the GPU as a motorboat overtaking you).
- Historical logging, alerts, or any notion of "reports".
- Per-process attribution — this is about the machine, not your code.

## Risks & unknowns

- IOReport may require entitlements or root on newer macOS; the `powermetrics` fallback needs sudo, which is a hostile install step for a toy.
- Polling at 2 Hz costs power, which is ironic for a thermal toy. Need to measure the toy's own wattage and show it honestly.
- The metaphor may be illegible to anyone who hasn't watched rowing. Mitigate with a one-time animated legend.

## Done means

Running a sustained `cargo build -j16` on a fanless MacBook Air produces: a visibly fast, in-time crew for the first ~40 seconds, then progressive phase decoherence, then two E-cluster rowers shipping oars as the scheduler parks them, with at least one crab animation coinciding with a `thermalState == .serious` transition confirmed in a side-by-side `powermetrics` log.
