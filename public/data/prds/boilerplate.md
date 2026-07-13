## Overview
Boilerplate is a single-player roguelike for engineers who write LLM agents. You feed it a real system prompt / tool-config (your Claude Code, Cursor, or homegrown agent) and it becomes a dungeon: each 'floor' is a chunk of context that eats your token budget before the user's actual prompt is reached. Sparked by the HN finding that Claude Code ships ~33k tokens of overhead before reading a word of the prompt.

## Problem
Context bloat is invisible and un-fun to fix. You know your agent is fat but pruning it feels like chores — no feedback, no reward, easy to rationalize keeping every tool 'just in case.' There's no playful pressure to earn each token.

## How it works
Your prompt is tokenized and segmented into rooms (system preamble, each tool schema, each few-shot example, safety text). Token budget = HP (say 8k). Descending, each room drains HP by its token cost. Rooms contain *capabilities* — abilities you keep only if you keep the room. A 'boss' is the actual user task at the bottom: you must arrive with enough budget AND the right retained capabilities to clear it. The loop: prune rooms to survive, but pruning too aggressively means you can't beat the boss. Runs are seeded by a config file so the same bloat = same dungeon; you compete on 'cleared the task with N tokens to spare.' Meta-progression: cuts you make can be exported as an actual trimmed config.

## Technical approach
Stack: TypeScript + a terminal UI (Ink) or a tiny canvas web game. Tokenization via `tiktoken`/`@anthropic-ai/tokenizer` for real counts. Parse the config: split JSON tool defs and markdown prompt into labeled segments with token costs. 'Capabilities' are tagged by regex/heuristic (a tool schema → the ability it grants; a few-shot → a 'style' buff). Boss tasks are a small library of canned prompts each requiring a set of capability tags to 'clear.' Hard part: mapping prompt segments → gameplay-meaningful capabilities without an LLM in the loop (keep it deterministic/offline); optionally an eval mode that actually calls the model with the pruned prompt to verify the boss is beatable.

## v1 scope
- Load one config file, tokenize, segment into rooms with costs
- Turn-based descent in a terminal; HP = token budget
- 5 canned boss tasks with required-capability tags
- Export the surviving segments as a trimmed prompt file

## Out of scope
- Live model calls / real eval (stub with tags first)
- Multiplayer / leaderboards
- Auto-optimization (the human does the cutting — that's the game)

## Risks & unknowns
- Segment→capability mapping may feel arbitrary; needs playtesting
- Fun only lands if cuts feel meaningful, not random
- Different providers tokenize differently

## Done means
I drop in my real agent config, descend, cut it from 33k to under 8k, beat a boss task, and export a config file that still works when I paste it back.
