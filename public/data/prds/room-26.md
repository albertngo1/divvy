## Overview

For one round, one player is silently replaced by an LLM impersonating them. Their phone shows a "you're taking a break" screen; the group chats normally in a shared room, and the bot generates messages in that player's voice — trained on a short pre-game "voice sample" everyone submits at lobby-in. Group must identify the bot from chat behavior alone. The replaced human sits it out but can watch. Per-phone matters because the human is invisibly benched — a shared screen can't hide who's typing.

## Problem

Turing-test style games (like AI Dungeon spinoffs) usually pit humans vs. AI in obvious framing. Room 26 hides the substitution: everyone thinks all 6 players are human until the vote. Requires per-phone architecture to invisibly bench one player and route their identity to an LLM. The whole game turns on chat texture — a genre only possible now that Haiku-class models can convincingly impersonate a 3-message voice sample in real-time.

## How it works

Lobby: each player types 3 sample messages (~15 words each) in their natural texting style — this is the voice corpus. Room starts, group plays a chat-driven task (e.g. "plan a fake heist together, chat only, 4 minutes"). At round start, server silently benches one random player and spawns a Claude Haiku bot with their name, voice corpus, and the ongoing chat as context. Benched player sees "you're on break — watch quietly" screen. After 4 minutes, group votes on who was the bot. Correct id = group wins; uncaught = bot wins.

## Technical approach

PartyKit or Socket.IO. Chat is a broadcast WebSocket message log. Bot is a server-side process that on each chat message decides whether to reply (probabilistic based on recent activity) and calls Claude Haiku with a system prompt including voice corpus + full chat log + persona instructions. Room state = `{phase, benched_player_id, voice_corpora, chat_log, votes}`. Rate-limit bot messages to human-plausible pace (one message per 8-25 seconds).

## v1 scope

1 round per game, 4-6 players, one bot-swap per round, 3-message voice corpus collected in lobby. Task: "plan a fake heist" (or one of 5 hand-authored group tasks). 4-minute chat phase, 45s vote. Score: binary. Uses Claude Haiku (`claude-haiku-4-6` or current). No voice, no images, no multi-round persistence.

## Out of scope

Voice mode, image sharing in chat, multi-bot rounds, adaptive persona learning across rounds, spectator mode with mid-game influence, custom task submission, bot playing multiple identities.

## Risks & unknowns

Voice-corpus-driven impersonation from 3 messages is thin — may need 5-8 messages for convincing texture, but longer lobbies kill vibe. Cost per round is ~10-20 Haiku calls at ~500 tokens each — manageable but non-zero. Third risk: humans might type faster/looser than the bot, giving obvious tells; may need to add typing-indicator faking. Fourth: benched player watching without spoiling in real life is on the honor system.

## Done means

4 friends play one round. Group makes a confident vote. Either the bot was caught (satisfying) or escaped (mind-blowing). At least one player says "no way, THAT was the bot?" and immediately wants another round.
