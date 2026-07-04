## Overview
A social-deduction group-chat game. Every player joins a shared chat room, but each phone privately assigns them a persona to fake ("you are a golden retriever's inner monologue", "you are a corporate LinkedIn thought-leader"). Players chat in-character. At the end, everyone votes on who had which persona. Points for correctly guessing others' personas, points for having yours guessed correctly (bad acting is worse than being caught).

## Problem
Werewolf-style social deduction requires the impostor to hide; here EVERYONE is an impostor of a different kind, and the puzzle is reverse-engineering personalities from text alone. This is only possible with per-phone private assignments (each player must see their own persona and no one else's) plus a shared chat surface. Also lets you play with the LLM as a persona generator — Haiku can invent absurd, precise personas that a human host wouldn't come up with.

## How it works
Room joins. Server assigns each player a unique persona via Haiku (from a seeded prompt like "generate 6 wildly specific chat personas, one sentence each"). Persona appears only on that player's phone. A shared chat opens; players send messages that appear to everyone with just their display name. Chat runs for ~5 minutes with a topic prompt ("plan a group vacation", "argue about pizza toppings"). When time's up, each player privately matches players ↔ personas on their own phone. Reveal shows the true personas and per-player scores.

## Technical approach
WebSocket room with a chat channel + private persona channel. On game start, server calls Haiku once with `n=playerCount` to generate distinct personas, then assigns one per player via private socket message. Chat is standard broadcast (sender name + text, no persona leaked). Voting phase: each player's phone shows a drag-and-match UI (drag persona cards to player names). Server tallies. Scoring: +1 per correct guess of another's persona, +1 if your persona was guessed correctly by ≥50% of others (rewards clear acting, not stealth). Per-phone privacy is load-bearing: the persona is invisible until reveal, or the whole game collapses.

## v1 scope
- 4-8 player rooms
- Haiku-generated personas (one API call per game, seeded prompt)
- Shared chat with ~5-minute timer
- One topic prompt per game (curated list of ~20)
- Private drag-to-match voting UI
- Reveal + scoring
- One round = one game

## Out of scope
- Player-authored personas
- Multiple rounds / persona rotation
- Voice/video chat
- Voting to eject players mid-game
- Persona categories or difficulty tiers
- Persistent leaderboard

## Risks & unknowns
- Haiku persona quality — needs prompt engineering to avoid bland / repetitive outputs
- Chat pacing: 5 minutes might be too short for shy players, too long for fast typers
- Group size sensitivity — 4 players makes matching too easy
- Someone will accidentally out their persona in the first message (clumsy players tank the game)
- Content risk: LLM personas need a light content filter

## Done means
4-8 players can join a room, each receive a private Haiku-generated persona, chat in-character on a shared channel for a fixed duration, then privately match personas to players and see a scored reveal. No client ever sees another player's persona before reveal.
