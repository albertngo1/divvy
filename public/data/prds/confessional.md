## Overview
A one-vs-many improv storytelling game. Each round, one player's phone shows a private prompt ("tell us about the time you got kicked out of a wedding"). They narrate a story aloud — either a real memory OR a total fabrication. The rest of the room votes truth or lie. Points for good liars, good detectors, and good truth-tellers who get called liars.

## Problem
Two Truths and a Lie is the archetype but it's stale: the prompts are self-authored (so people optimize for safe-boring), and there's no time pressure. The upgrade is *forcing* the topic via a private prompt only the storyteller sees — you can't pre-cook a lie because you don't know what you'll be asked. This requires per-phone privacy in a way a party card game can't do: the prompt must be visible to exactly one player and invisible to everyone else.

## How it works
Room joins. Server picks a storyteller and shows a prompt only on that player's phone, plus a hidden coin-flip: TRUTH or LIE. If TRUTH they must tell something real; if LIE they must fabricate. They narrate aloud for ~90 seconds. Others can shout follow-up questions. When done, everyone else votes on their own phone: truth or lie. Reveal: storyteller taps to show the coin-flip. Scoring: storyteller earns points for fooling the room; audience earns points for correct votes. Storyteller rotates.

## Technical approach
WebSocket room. Per-round state machine: `assign` (server picks player + flips coin) → `narrate` (only storyteller's phone shows prompt + T/L; others see waiting screen with vote buttons grayed) → `vote` (audience phones activate secret vote) → `reveal`. Prompt deck is curated JSON — categories include childhood, work, romance, minor crimes, family, humiliation. Per-phone privacy is load-bearing twice: the prompt itself is private (so no one else knows what topic will be), and the coin-flip is private (so no one else knows whether the storyteller is trying to lie). Optional Haiku "story critic" later for prompt variety, but v1 is hand-authored.

## v1 scope
- 3-8 player rooms
- Curated prompt deck (~60 prompts across 6 categories)
- Server-assigned storyteller + private truth/lie coin
- 90-second narration timer (soft)
- Per-phone secret truth/lie vote
- Reveal + score, rotate storyteller
- 1 round per player = game

## Out of scope
- LLM-generated prompts
- Follow-up question mechanics (structured)
- Video/audio recording
- Category selection by players
- Team-based scoring

## Risks & unknowns
- Some players will freeze on "make up a story right now"
- Shy players may hate being the storyteller
- Prompt calibration is (again) the whole game
- Need a "pass" that isn't a scarlet letter

## Done means
3-8 players can join a room, be assigned as storyteller with a private prompt + hidden T/L instruction, narrate aloud while others vote secretly on their own phones, and see a reveal with scoring — all without the prompt or the coin-flip ever leaking to another client.
