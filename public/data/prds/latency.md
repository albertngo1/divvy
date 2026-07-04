## Overview

The group plays any real-time task — a shared drawing prompt, a rapid trivia question, a "everyone react to this image" burst. But one player (the Laggard) has their phone artificially delayed: prompts arrive 5 seconds after everyone else's. They have to fake real-time reactions using context clues from the group's chat, gasps, and typing, then catch up when their own prompt finally lands. Vote on who was lagging. Per-phone is essential: the deception requires each player's screen to update on its own clock; a shared screen is instantly synchronous.

## How it works

Room code join, 4-6 players. Server picks a real-time task per round: e.g. "React to this image with one word — go!" or "You have 15 seconds to answer: what's a fruit that starts with K?" One player is silently designated Laggard; their prompt appears 5 seconds later than everyone else's. Everyone sees a live chat feed of typed reactions. The Laggard sees only the chat feed for 5 seconds and must type *something* plausible before their real prompt arrives. Round ends after 20s. Discussion + vote on who lagged. Group wins on correct id; Laggard wins if uncaught.

## Problem

Real-time reactions are the hardest thing to fake — the tell isn't *what* you say, it's *when*. Every existing deduction game hides identity or goals; almost none exploit timing. Per-phone architecture makes this natural: each phone has its own clock and its own arrival time for a prompt, invisible to others. On a shared screen this is impossible — the prompt lands for everyone at once.

## Technical approach

PartyKit or Socket.IO. Server maintains phase clock; prompts are broadcast normally, EXCEPT the Laggard's client-side prompt render is delayed by a server-instructed offset (5000ms). Chat messages are real-time for all. Prompts drawn from a library of ~40 fast-response tasks (word associations, one-word reactions, quick trivia). Room state = `{round, task_id, laggard_id, prompt_start_ts, chat_log, responses, votes}`. Vote via tap on player tile.

## v1 scope

3 rounds, 4-6 players, 40 hand-authored fast-response prompts, one Laggard per round rotating. Round: 5s launch delay for Laggard, 20s response window, 45s discussion, 20s vote. Score: +1 correct accuser, +2 uncaught Laggard. No adaptive difficulty, no voice, no timing-visualization UI.

## Out of scope

Voice reactions, replay of when each person typed, timing-graph reveal, LLM prompt generation at runtime, spectator mode, adjustable delay per round, mobile-app native version.

## Risks & unknowns

5-second delay may be too obvious or too subtle — needs playtest tuning. Some prompt types (image reactions) might make the delay unfakeable because the chat gives away the image; others (word associations) might be too fakeable. Second risk: on slow networks, everyone has variable delay, muddying the signal — need to display a "your ping" indicator or reject rooms with high latency variance. Third: the Laggard might feel bad / stressed rather than deviously fun — mechanic depends on the vibe.

## Done means

4 friends play 3 rounds, correctly catch the Laggard at least once, get faked out at least once. At least one player says "wait, I thought Anna was lagging but it was me who was slow".
