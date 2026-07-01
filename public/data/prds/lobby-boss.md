## Overview
Lobby Boss is a management sim where the invisible algorithm becomes the protagonist. Instead of fragging in Dead by Daylight or Rust, you play the matchmaking system behind a live game, pairing players into lobbies each night to maximize a single boss-mandated metric: retention. For systems nerds and anyone who's screamed 'who MADE this matchmaking?!'

## Problem
Matchmaking is the most-consumed, least-visible system in online games — millions endure it nightly, blame it, meme it, and never see the gears. It's a rich, dramatic optimization problem (skill vs. wait-time vs. mood vs. monetization) hiding behind a spinner. Nobody's turned that tension into a game where *you're* the one making the impossible tradeoffs.

## How it works
Each 'night' a queue of players streams in, each a card with hidden-ish stats: skill, tilt/mood, patience (wait tolerance), spend tier, and a play style. You drag them into lobbies before their patience runs out. Outcomes simulate: lopsided matches tank losers' mood and spike quit risk; long waits bleed the queue; a stomped whale might refund and churn. Between nights the Boss hands you shifting KPIs ('this week: retain new players' / 'this week: hit revenue') that force you to game your own system — the mischievous core. Meta-progression unlocks tools: hidden MMR, smurf detection, bot backfill.

## Technical approach
Stack: a single-page game in TypeScript + a lightweight ECS (or plain reducer state) rendered with PixiJS or just DOM/CSS for the card-drag UI; no backend needed. Core is a deterministic match-outcome simulator: given two teams' skill vectors, sample a win probability (logistic on skill delta), then update each player's mood/patience/quit-probability via simple state transitions. Data model: `player{skill, mood, patience, spend, style}`, `lobby{slots, mode}`, `night{queue, kpi, budget}`. Seeded PRNG for reproducible runs and daily-challenge sharing. The hard part is *legible* balance: making the sim's cause→effect chains transparent enough that players learn the levers instead of flailing, while keeping the whale-vs-newbie tension morally spicy.

## v1 scope
- One night loop: a queue of ~20 player cards, drag into 2 lobbies
- Match sim produces win/loss and updates mood + quit chance
- One KPI (retention %) scored at night's end
- Seeded daily queue

## Out of scope
- Meta-progression / tool unlocks
- Multiple game modes, art polish
- Multiplayer or leaderboards

## Risks & unknowns
- Sim legibility — players must *feel* their decisions mattered
- Difficulty of making tradeoffs interesting rather than obvious
- Tone: keeping the whale/monetization satire fun, not cynical

## Done means
A player can complete one full night — draining a real queue into lobbies, seeing simulated match outcomes shift player moods and quit rates — and get a final retention score that provably changes based on how they matched people.
