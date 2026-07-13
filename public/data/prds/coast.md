## Overview
A phone app that passively scores every car trip on *smoothness* — fewest hard brakes and accelerations, most steady coasting — and ranks you on a per-corridor leaderboard against other commuters on the same road. Zero interaction; it just runs. For people whose daily commute is dead time they'd like to make mean something.

## Problem
You drive the same route every day with no feedback on how you drive it. Jerky driving wastes fuel and stresses everyone, and Google's own research frames congestion as a coordination problem — but as an individual driver you have no signal on your own contribution to flow. Passive, repetitive, unaccountable.

## How it works
The app detects drive start/stop from motion + speed and samples accelerometer and GPS in the background. It computes a per-trip "flow score" (0–100) from jerk — the derivative of acceleration — penalizing hard braking, hard acceleration, and stop-and-go, rewarding long steady coasts. After you park, a card summarizes the drive ("You coasted 71% of this trip"). Weekly, you're ranked against anonymized commuters on the same road segments; the smoothest driver on a corridor tops that ladder. Streaks for consecutive smooth commutes.

## Technical approach
React Native / Expo with background geolocation and `expo-sensors`. On-device: low-pass filter acceleration, compute jerk RMS, threshold-detect brake/accel events, segment the trip by speed. Map-match the GPS trace to OSM road segments (Valhalla or a local map-matching lib) so leaderboards are per-corridor. Backend: Supabase/Postgres storing anonymized segment scores; leaderboards are window functions over segment + week. Hard part: reliable, low-battery on-device drive detection, and fairly separating your braking from traffic-forced braking via speed-context weighting.

## v1 scope
- single-user flow score per trip, no leaderboard
- manual start/stop
- jerk-based scoring
- a trip-history list

## Out of scope
Corridor leaderboards, map-matching, social features, streaks, Android background reliability.

## Risks & unknowns
Battery drain; accelerometer noise from a loose phone; distracted-driving optics (must be strictly zero-interaction); fairness when traffic forces braking; location privacy.

## Done means
Complete a real drive with the phone in your pocket and get a smoothness score within seconds of parking that visibly drops when you brake hard and rises when you coast.
