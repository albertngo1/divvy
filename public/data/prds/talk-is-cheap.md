## Overview
Talk Is Cheap is a 3-5 player social-dilemma party game where speaking is a scarce, private currency. The host TV throws quick call-out prompts at the group; every player's phone privately holds a small, hidden budget of words they're allowed to say the entire round. Answer and you help the team — but you spend a word you can never get back, and unspent words are worth points.

## Problem
Party games treat talking as free and infinite, so the loudest player dominates. Talk Is Cheap prices every word. The itch is a nonverbal standoff: the whole table stares at a prompt only someone must answer, everyone silently praying a rival burns a word first — because nobody knows how many anyone else has left.

## How it works
The TV shows a stream of fast prompts ('say a color', 'name a dog breed') on a timer, plus shared team lives. When a prompt appears, *someone* must speak a valid answer aloud before the timer runs out or the team loses a life. Each vocalization is attributed by the mics to the speaker's phone and deducts one word from *their* private budget; overspending past zero eliminates that player. Each phone privately shows only its own remaining budget (say, 2-3 words) and a live bonus tally (unspent words = points). Nobody sees anyone else's budget. Survive the prompt stream; final score = remaining budget minus life penalties, so hoarders win — if the team survives.

Private per phone: your hidden budget, your bonus. Shared on TV: prompts, timer, team lives, and who just got charged a word.

## Technical approach
Authoritative WebSocket server (Socket.IO over Tailscale Serve). Data model: `Player { budget, spent, alive, micRMS }`, `Round { prompt, timer, lives }`. Every phone streams a WebAudio voice-activity envelope. The genuinely hard part is *attribution*: when a word is spoken in a shared room, all mics hear it — the server must decide whose word it was by comparing per-phone RMS onset and timing (nearest/loudest mic wins, with a guard band so one loud player isn't charged for a neighbor's answer). A short per-phone gain calibration precedes the round; ambiguous overlaps prompt a re-say.

## v1 scope
- 3 players, one round, ~10 prompts
- Fixed budget of 2 words each, 3 team lives
- Loudest-onset mic wins attribution
- Host shows prompts, lives, and a 'charged!' flash

## Out of scope
- Answer-validity checking beyond timing (any vocalization counts in v1)
- Multi-round scoring, variable budgets, reconnection

## Risks & unknowns
- Mic attribution in a small room may misfire on simultaneous answers
- Distinguishing a real answer from a cough/laugh without full ASR
- Balancing budget vs. prompt count so the dilemma bites

## Done means
Three phones each with a hidden 2-word budget play a 10-prompt round where every spoken answer is correctly charged to the right player's phone, at least one prompt visibly dies to collective silence, and the final scoreboard rewards the player who hoarded words while the team survived.
