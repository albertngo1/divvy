## Overview
Dead Ringer is a silent-Schelling party game for 3 players. Each phone is a tiny character creator with a few features (hair, face color, hat, accessory), and the goal is for everyone to independently build the *identical* avatar — no talking, no peeking. It's the joy of a blind reveal where three people who couldn't communicate all made the same guy.

## Problem
Convergence games usually hide behind abstract sliders and heat meters. Dead Ringer makes the shared target a *character* — legible, funny, and instantly gratifying on reveal ('we all picked the bald one in sunglasses?!'). The whole point is simultaneous, private construction; pass one phone around and there's no blind reveal and no game.

## How it works
**Each phone privately shows:** an avatar builder with 4 features, each a small carousel of 3 options (e.g. hair: spiky/bald/curly). You build a full avatar and lock it. Nobody sees anyone else's phone.

The game runs **3 fast rounds**. After Round 1, the **host screen** reveals an *anonymized per-feature tally* — 'hair: 2 spiky, 1 bald; hat: 3 none' — but never which player chose what, and never the assembled faces yet. Players use those tallies to silently converge: obvious majorities pull the room toward one answer, ties force someone to blink. Rebuild and re-lock for Round 2, then Round 3.

After Round 3, the host reveals all three finished avatars side by side and a **Match Score** = number of features where all three agree (0–4). Four-for-four is a 'Dead Ringer' — confetti. The load-bearing private state is each phone's in-progress avatar plus each player's private read of the tallies; simultaneity and secrecy are the game.

## Technical approach
Host tab + phone PWAs + WebSocket server (Socket.IO over Tailscale Serve or PartyKit). **Data model:** `room{round, featureSpec}`, `pick[playerId][round]{hair,face,hat,acc}`. Round-based submit — sync is genuinely easy here (no real-time streaming; just barrier-synced lock-ins). **Sync strategy:** server waits for all locks, computes per-feature counts, pushes the anonymized tally to every phone + host. **Genuinely hard part:** not networking — it's *feature-set design*. Options need strong Schelling pull (a clear 'default' the room gravitates to) but enough symmetry that Round 1 isn't unanimous instantly, so the convergence arc actually happens across 3 rounds.

## v1 scope
- 3 players, 4 features × 3 options each, 3 rounds
- Anonymized per-feature tally between rounds (counts only, no identities)
- Host side-by-side reveal + 0–4 Match Score

## Out of scope
- More features/options, custom color pickers, saving avatars, >3 players, sabotage/traitor roles

## Risks & unknowns
- Round 1 could be a coin flip; the tally feedback must reliably create convergence, not thrash
- Poorly chosen options make one answer too obvious (instant win) or too flat (never converge)

## Done means
3 phones each build a private 4-feature avatar and lock; the host shows an anonymized per-feature tally between three rounds and, at the end, three assembled avatars with a 0–4 Match Score that fires a 'Dead Ringer' celebration at 4.
