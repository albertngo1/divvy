## Overview

A three-player silent coordination game for a living room with a TV and three phones. Each player privately holds six emoji tiles. Each must discard five, one at a time, in real time. The room wins only if all three final surviving tiles are the same emoji. Nobody may speak. The entire communication bandwidth of the game is the public discard pile — what you throw out, and when.

## Problem

Most "secretly match each other" games hand players a shared menu and hope for a Schelling point ("we'll both pick the pizza"). That's a one-shot coin flip with no play in it. The itch: a convergence game where information genuinely *accrues* over the round, where the act of narrowing your own options is itself the only way to speak, and where every message costs you a card you can never take back.

## How it works

The server deals from a 10-emoji pool so that exactly **two** emoji appear in all three hands (the "universals") and the other four in each hand are junk — each junk tile is held by at most one other player. Nobody is told which of their tiles are universal.

**Private on each phone:** your six tiles, a big DISCARD button per tile, and a counter of how many discards you have left. That's all.

**Public on the TV:** a growing discard river — every discarded emoji appears face-up, tagged with who threw it, in order. Plus three "cards remaining" counters.

The deduction: if an emoji appears in someone else's discards and you also hold it, it is now dead as a match target — you can never win on it. So players race to safely dump junk while preserving candidates. Because you must discard five of six, you are eventually forced to throw one of your two universals. Whoever blinks first effectively chooses the answer for the room, and everyone else must read that discard correctly and keep the other one. The comedy is in the stall-off: three people holding at two cards, thumbs hovering, nobody wanting to be the one who picks.

## Technical approach

Host browser tab plus phone PWAs against an authoritative WebSocket server (PartyKit / Cloudflare Durable Object, one DO per room code). Server state: `{players: {id, hand: Emoji[], discarded: Emoji[]}, pool, phase}`. Hands never leave the server except to their owner — the host tab is sent only the discard river, so a nosy TV reveals nothing.

Dealing is the hard part, not sync: generating a hand set with exactly two universals, controlled junk overlap, and no accidental third universal requires a small constraint solver with rejection sampling — and it must be re-verified server-side before dealing, or the puzzle is silently unsolvable.

Sync is simple by design (discards are discrete, ~15 events per round), but two things must be atomic: discards are serialized per-room so the river order is canonical, and a phone at one card is locked out of discarding entirely. Reveal is a single broadcast after all three hit one card.

## v1 scope

- Exactly 3 players, 1 round, no lobby beyond a 4-letter room code
- Fixed 10-emoji pool, server-side dealer with the two-universal guarantee
- Discard river on TV, six-tile hand on phone, no timer
- Win/lose reveal screen showing all three survivors side by side

## Out of scope

Scoring across rounds, 4+ players, chat/emotes, timers, difficulty tiers, spectators, reconnect.

## Risks & unknowns

The round may be trivially solvable if the pool is too small — three universals by accident collapses it. Untimed play could stall forever at two cards (a soft 20s nudge may be needed). Unclear whether players intuit that a discard is a *message* without a tutorial line on the TV.

## Done means

Three phones join by code, get disjoint-but-overlapping six-tile hands, discard live to a shared TV river, and the host correctly declares WIN when all three survivors match and LOSE otherwise — with a playtest showing at least one round where the room converged and one where it didn't.
