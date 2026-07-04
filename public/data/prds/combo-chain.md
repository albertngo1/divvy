## Overview
Combo Chain drops fighting-game timing into a party format. Each phone gets a unique, private combo sequence (tap-hold-release-swipe patterns). Land your combo cleanly and the host TV plays a screen-shaking effect for the whole group. Land it within 1 second of someone else's finisher and you both get a chain bonus. Stack three chained combos across the group and a cross-phone SUPER MOVE unlocks. The catch: your combo string is never revealed to anyone else, so nobody in the room can copy or telegraph what you're about to pull off.

## Problem
Fighting games (Street Fighter, Guilty Gear) have the tightest, most satisfying input timing in games — but they're 1v1 and require memorization of frame data. Party games have zero mechanical execution — everything's social or trivia-based. There's a gap: a party game where physical dexterity and timing matter, but the skill floor is a per-round taught pattern instead of years of memorization.

## How it works
3-6 phones in a room. Each player is dealt a private combo string like `TAP-HOLD(0.5s)-RELEASE-SWIPE-UP`. Your phone shows only your own string, in-order, with a moving cursor and timing window for each input. Executing the full combo triggers a group-visible effect on the host screen (screen-shake, damage number, character animation). The scoring twist: if your first input lands within 1000ms of another player's finisher, you get a "chain" multiplier. Three chained finishers within a rolling 5-second window trigger a SUPER — a coordinated 2-phone input the room must solve on the fly. Rounds are 90 seconds; highest total score wins.

## Technical approach
Sub-100ms client-side input tracking via `pointerdown`/`pointerup` + high-res `performance.now()` timestamps; each raw input is sent to the server with its local timestamp, server corrects for clock offset (established via handshake at join) and stamps a canonical event time. Cross-player timing correlation is a rolling window on the server: on every combo-finish event, check for another player's finish within ±1000ms canonical. Combo strings are randomized per player per round from a template bank (~20 templates × 4 input types) and stored server-side only; the owning phone receives its string over a private socket, never broadcast.

## v1 scope
- 4 combo templates, 3-input length only (no hold+swipe hybrids)
- One round, 90 seconds, single "boss" opponent on host screen
- Chain bonus (2-player, ±1s window) only; SUPER moves deferred
- Score = sum of combo values × chain multiplier

## Out of scope
- Cross-phone SUPER moves (deferred, but scoring hooks stubbed)
- Character selection, movesets, stances
- Progression, unlocks, persistent stats

## Risks & unknowns
- Sub-100ms feels tight on wifi with jitter — may need to widen to 150ms
- Private combo strings mean players can't see what teammates are doing, which could feel isolating; effect on host TV must be loud enough to feel shared
- Combo variety with 4 templates may get old fast

## Done means
Four phones in a room play one 90-second round, at least one 2-player chain fires with the ±1s window correctly detected server-side, and the final scoreboard reflects combo counts + chain multipliers — verified against a scripted playthrough.
