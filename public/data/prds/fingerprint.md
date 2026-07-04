## Overview
A confessional party game where prompts describe real-life scenarios ("who in this room has cried in an Uber?"), players secretly confess yes/no, and the group tries to guess who the yeses are. It's Fuck-Marry-Kill's honest cousin: the fun is in the mismatch between the story your friends tell about you and the story you tell about yourself.

## Problem
Group storytelling games either force you to volunteer embarrassing truths in public (which nobody does honestly) or drift into fictional territory that has no stakes. The middle ground — *did this really happen to someone in this room?* — is only playable if confessions are truly anonymous AND the group has to publicly reason about who did it. That combination requires per-phone privacy for the confess step and a shared screen (or shared prompt) for the guess step.

## How it works
Prompt appears on all phones: "Who has been on a date they scheduled during another date?" Each player privately taps YES or NO on their own phone. Server tallies: "3 people said yes." Now the guessing phase — everyone (including the confessors) points at who they think the 3 are. Reveal: the yeses are highlighted, and each guesser sees how many they got right. Score by correct guesses; the confessors score by staying hidden. Next prompt.

## Technical approach
WebSocket room state. Two phases per prompt: `confess` (per-phone binary, aggregated to a count only) and `guess` (per-phone multi-select of players, submitted privately). Server holds both truth and guesses, reveals confessor identity only after all guesses are in — no client ever sees "player X confessed yes" until the reveal moment. Per-phone architecture is load-bearing: confessing on a shared screen defeats the entire premise. Prompt deck is curated JSON (~100 real-life scenarios spanning cringe, romance, minor crime, embarrassing childhood). No LLM in v1 — prompt quality matters more than variety.

## v1 scope
- 4-10 player rooms
- Curated prompt deck (~100 scenarios)
- Two-phase per prompt: confess (yes/no) → guess (pick who)
- Reveal shows confessors + per-player guess accuracy
- Running score across the session
- Host ends game

## Out of scope
- LLM-generated prompts
- "Doubling down" / betting mechanics
- Player-submitted prompts (moderation nightmare in v1)
- Team play
- Sharing results outside the room

## Risks & unknowns
- Prompt calibration: too mild = boring, too spicy = someone gets outed
- With small groups, a "1 yes" reveal is basically un-anonymous
- Need a "skip prompt" release valve without shaming the skipper
- Repeat play in the same friend group — do prompts get stale fast?

## Done means
4-10 players can join a room, get a prompt, confess privately on their phones, then vote publicly on who the confessors are, and see a reveal with scoring — all with no client ever leaking a confession before the reveal.
