## Overview

A per-phone reimagining of *The Chameleon* (Big Potato Games). Every player's phone shows the same 4x4 word grid — but with one secret cell highlighted for everyone *except* the Chameleon (chosen at random each round). Players take turns saying one-word clues that should point at their known cell without giving away its location. The Chameleon must fake a plausible clue based on what others have said. After the clue round, everyone votes on who the Chameleon is. The phone is load-bearing because each player's screen either shows the highlighted cell or hides it — impossible to fake with one shared device.

## Problem

The physical Chameleon requires a shared card that the Chameleon *can't see* while everyone else can — a card everyone at the table has to be careful not to expose. Awkward, requires the group to physically shield things. Digital and per-phone is the natural home for it, but every existing digital adaptation of Chameleon is just a webcam-shielded version of the card game. Nobody has built a proper per-phone version that actually uses the private-screen affordance to eliminate the card-shielding awkwardness.

## How it works

Room code join, 4-8 players. Round starts: server picks a 4x4 grid of themed words (e.g. category "food") and a secret target cell. It also picks one player as the Chameleon. Every non-Chameleon phone displays the grid with the target cell highlighted; the Chameleon's phone shows the grid with NO highlight — they must pretend they see one. Players take turns typing (or saying — up to the group) a one-word clue. Screen shows the clue log. After each player has given one clue, everyone secretly taps who they think is the Chameleon. Reveal: correct votes score for the accuser; Chameleon scores if not caught. Rotate roles, next round.

## Technical approach

PartyKit or homelab Socket.IO. Room state = `{round, grid_words: [4][4], target_cell: {row,col}, chameleon_id, clue_log, votes}`. Each phone subscribes to a personalized view: non-Chameleons get `target_cell` in payload, Chameleon does not. Grid themes hand-authored (~30 themes) or Haiku-generated with `{category: <theme>, count: 16, coherence: high}`. Voting via tap on player name tile. No sensor deps.

## v1 scope

3 rounds, 4-6 players, 10 hand-authored 4x4 grids across 3 themes (food, movies, animals), one Chameleon per round, chosen randomly (no repeat until all played), score = correct-accuser wins + Chameleon-not-caught wins. 60s clue phase (typed clues, one per player), 30s vote phase. No LLM-generated grids in v1, no theme voting, no continuous session.

## Out of scope

LLM grid generation, custom themes, voice-only clue mode (typed only), spectator mode, replay analysis, Chameleon reveal animations, streak scoring, in-game chat beyond the clue log.

## Risks & unknowns

The core mechanic (deducing whether someone is faking) is proven by the physical game; the risk is whether typed clues feel like the "spoken clue" experience or feel too deliberate. Playtest suggests voice > typed for Chameleon-style games; may need voice mode as a v1.1. Grid quality is the biggest lever — grids that are too coherent (all synonyms) make the Chameleon impossible to distinguish; too incoherent means the clue means nothing. 30 hand-authored grids is a real chunk of curation work — spend an evening on it before code.

## Done means

4 friends open the room, play 3 rounds each with a different Chameleon, and the group correctly identifies the Chameleon at least once and misidentifies at least once. If someone accuses their partner and gets it hilariously wrong, v1 shipped.
