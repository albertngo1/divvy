## Overview
A Home Assistant add-on that runs an LLM-authored fake resident. While you're away, 'Squatter' generates and executes a plausible day-in-the-life — coffee light at 6:40, WFH office lamp, an evening TV glow, blinds that follow actual sunset — so your empty house reads as occupied. For homelab tinkerers who already run Home Assistant and want deterrence smarter than a 1970s lamp timer.

## Problem
Burglary-deterrent presence simulation exists but is dumb: random on/off timers that flip lights at implausible hours with no correlation to weather, day-of-week, or how humans actually move through a home. Sophisticated casers can spot the randomness. Meanwhile 'Simulating the Resident' (LLM personas generating executable smart-home schedules) shows an LLM can author a *believable* routine — that capability is cheap for a homelab owner but unavailable as a turnkey deterrent.

## How it works
You define a persona once (e.g. 'freelancer, cat, gym Tue/Thu, night owl on weekends') and your device inventory. Each night, Squatter asks an LLM to produce the next day's schedule as a structured event list — timestamps + device + action — conditioned on day-of-week, sunset/sunrise, and the local weather forecast (blinds close early on gray days; lights linger later in winter). A validator clamps events to your real devices and sane bounds, then it schedules them via the Home Assistant API. Small stochastic jitter (±minutes) and rare 'anomaly' events (someone up at 2am for water) break machine regularity. A dashboard shows today's planned 'life' and a log of what fired.

## Technical approach
Python service (or HA custom component) talking to the HA REST/WebSocket API for device discovery and `call_service`. Weather from the built-in HA weather entity or Open-Meteo; sun times from HA's `sun` integration. LLM (any provider) returns JSON validated against a schema listing your actual `entity_id`s and allowed actions; invalid events are dropped, not executed. Scheduler is APScheduler or HA automations generated from the plan. Data model: `persona`, `devices[]`, nightly `schedule[] = {t, entity, action, reason}`. The hard part is the safety envelope — never let a hallucinated event unlock a door or run the oven; whitelist device *classes* (lights, media, covers) and hard-block locks/appliances.

## v1 scope
- One persona, lights + media + covers only
- Nightly LLM plan generation with schema validation and device whitelist
- Executes today's plan; dashboard shows planned vs fired events

## Out of scope
- Locks, thermostats, cameras, anything with a safety consequence
- Multi-resident households, learning from your real historical patterns
- Cloud service — self-hosted only

## Risks & unknowns
- LLM emitting an implausible or unsafe event — mitigated by the whitelist + validator, but needs hard testing
- Believability is unmeasurable without a real adversary; can only sanity-check against your own habits
- Prompt/API cost is trivial (one call/night) but availability during a network blip must degrade to yesterday's plan

## Done means
With HA connected, Squatter generates a validated next-day schedule referencing only real whitelisted devices, executes it on time with jitter, correctly shifts light timing with the day's actual sunset, and never issues an action outside the whitelist across a week of dry-run testing.
