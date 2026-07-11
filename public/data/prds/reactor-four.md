## Overview
Reactor Four is a fullscreen ambient dashboard that renders your homelab as the control room of a 1970s Soviet nuclear reactor. Skeuomorphic analog gauges, nixie-tube counters, rows of blinkenlights, a central glowing "core," and dramatic alarms — all driven by real metrics. For homelabbers with a spare monitor or wall-mounted TV who find Grafana beautiful only to themselves.

## Problem
Observability panels are sterile. The HN love for vintage Soviet control rooms shows people crave *theater* in their instrumentation. A homelab hums along invisibly; there's no joy, no drama, no reason to glance at it. Reactor Four turns "disk at 82%" into an impending meltdown you feel in your gut.

## How it works
Metrics map to control-room elements: composite CPU/IO load → central "core temperature" with a rising glow; per-disk usage → nixie fill counters; network throughput → sweeping bar meters; service up/down → panel indicator lamps. When a monitored service goes down, a red panel lights, a klaxon sounds, and the core needle redlines with a "SCRAM" banner. Cyrillic labels, film-grain vignette, subtle idle hum. Fully passive — you just leave it on.

## Technical approach
Web app (SVG + Canvas, optional WebGL glow), served from the homelab. Data source: Prometheus/node_exporter query API, or a simple polling shim reading `docker ps`, `df`, `/proc`. A config file maps metric → gauge {source query, min, max, redline}. Damped-needle animation via a spring integrator so needles overshoot and settle like real galvanometers. Web Audio for klaxon/hum. Hard part: mapping arbitrary metrics to *believable* gauge ranges without a config nightmare, and smooth needle interpolation between sparse poll samples.

## v1 scope
- 4 analog gauges + one central core meter bound to node_exporter
- Nixie disk counter
- One klaxon + red banner on a single service-down check
- Fullscreen kiosk mode
- YAML metric→gauge config

## Out of scope
- True 3D room
- Multi-host fleets
- Historical playback / time scrubbing
- Configurable alarm rules UI

## Risks & unknowns
- Novelty may wear off after a week
- Alarm fatigue if flapping services klaxon constantly (need debounce)
- Skeuomorphic assets are art-heavy to make convincing

## Done means
Left running on a monitor, it shows live needles tracking real load; manually stopping a watched service fires the klaxon, lights the red panel, and redlines the core within one poll interval.
