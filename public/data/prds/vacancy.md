## Overview
Vacancy is a single-player daily deduction game. You're handed one week of a smart home's raw event stream — motion, door, thermostat, light, and lock events — from a household whose 'pattern of life' you must learn. On exactly one day, the resident was replaced by an intruder mimicking their routine, and you have to find the day (and the tell) from behavioral anomalies alone. It turns the eerie arXiv work on LLM-generated resident schedules and analyst crime-linkage into a Wordle-shaped puzzle.

## Problem
Deduction games usually hand you clean clues. Real forensic sensemaking is about noticing what *doesn't* fit a learned baseline — the shower that ran too short, the door opened from the wrong side, the 6:40 a.m. coffee that happened at 6:05. That's a satisfying, underexplored puzzle space, and nobody's built a tight daily game around 'spot the anomaly in a routine.'

## How it works
You scrub a timeline of ~200 events across 7 days, filterable by room and device. Days 1–6 establish the resident's habits (they're consistent but noisy). On the anomaly day, an intruder's persona produces subtly wrong sequences — right actions, wrong order, wrong durations, wrong entry vectors. You get three guesses: pick the anomalous day, then the anomalous hour, then the single 'smoking gun' event. Score is guesses-used; a shareable emoji grid ('🟩🟨⬜') spreads it. Difficulty ramps: early puzzles have a blatant tell, late ones require cross-referencing two devices.

## Technical approach
Stack: static site (Svelte) + a nightly offline generator. The generator builds resident personas as small stochastic routine models — a daily schedule template with per-event jitter distributions (Markov transitions over rooms + log-normal dwell times), seeded per date so every player gets the same puzzle. The intruder is the same generator with a *perturbed* persona (swapped transition weights, wrong entry node, compressed dwell). Events serialize to a compact JSON the client renders as a timeline. The genuinely hard part is fairness calibration: the anomaly must be provably detectable from the visible signal yet not trivially obvious — so the generator scores each candidate puzzle by how many baseline features the anomaly violates and rejects any outside a target band.

## v1 scope
- One persona archetype, 4 sensor types, a 7-day timeline
- Fixed anomaly types (wrong-order + wrong-duration only)
- Three-stage guess (day → hour → event) with emoji share

## Out of scope
- Real Home Assistant log ingestion (procedural only in v1)
- Multiplayer / accusation-vote modes
- LLM-authored flavor text (deterministic generation first)

## Risks & unknowns
Anomaly fairness is the whole game — too subtle is unwinnable, too loud is boring, and the difficulty band is hard to tune. Reading a raw timeline may feel like homework; the UI has to make scrubbing feel like play, not log-diving.

## Done means
A player loads today's puzzle, filters the timeline, correctly identifies the anomalous day/hour/event, sees a solve screen explaining the tell, and copies a spoiler-free emoji result — with the same seed producing an identical puzzle for everyone that day.
