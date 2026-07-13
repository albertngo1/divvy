## Overview
Beeline is a 3–5 player covert-steering party game. Players collaboratively write a short story on the shared screen, one sentence each per turn — but every phone privately holds a different secret target word. Your goal is to bend the shared story so that, when it's done, a tiny in-browser LM finds YOUR word the least surprising thing to say next. You're tugging a shared object toward a private destination while everyone else pulls elsewhere.

## Problem
Most co-writing games are pure improv with no scoring spine. Beeline gives every contribution a hidden, adversarial payload: the model's next-token surprisal is a real, contestable objective. The itch is subtlety — steer too hard toward your word and rivals notice and counter-steer; too gently and the story drifts past you.

## How it works
Each phone PRIVATELY shows a secret target word (e.g. "lighthouse", "betrayal", "soup"). The shared TV shows the growing story and the current turn order. On your turn, your phone lets you type one sentence to append; other phones show only "Player 3 is writing…" and the public story so far. Three turns around the table (9–15 sentences total for a 3–5 room), then it's done.

Scoring: the host feeds the final story into distilgpt2 (transformers.js) and, for each player, computes the model's surprisal for their secret word as the *next token* after the story. Lowest surprisal wins — you steered best. The TV reveals everyone's secret word and their surprisal, so the room sees the invisible tug-of-war it just played: who nudged toward "lighthouse" the whole time, who got buried.

The fun: you must make the story *want* your word without writing your word (writing it outright is banned and validated server-side).

## Technical approach
Host tab owns the single model instance; phones are PWA controllers over an authoritative WebSocket server (PartyKit / Durable Object). State: `{story:[sentences], targets:{playerId->word}, turnOrder, currentTurn, surprisals:{}}`. Turn-gating is strict: server only accepts a sentence from the active player. On completion the host scores all targets and posts back. Hard part: surprisal of a single word after a long context can be dominated by the last sentence — must normalize (e.g. min surprisal of the word across the last few token positions, or a short window) so late-turn players don't trivially win by ending on-theme. Turn order rotation partly balances this.

## v1 scope
- One game, 3–5 players, exactly 3 turns each
- Pre-set secret-word bank (~20 concrete nouns/abstracts), dealt distinct
- Banned-word validation (can't type your own target)
- Single reveal + surprisal leaderboard

## Out of scope
- Multiple rounds, cumulative scoring
- Player-chosen words
- Real-time per-keystroke feedback
- Anti-collusion / spectators

## Risks & unknowns
- Last-mover advantage from context recency — mitigation above is unproven
- Abstract targets ("betrayal") may be unscorable vs concrete nouns; v1 favor concrete
- Players might not feel their steering mattered if surprisals cluster — needs playtest tuning of story length

## Done means
4 phones each show a distinct secret word; the room builds a 12-sentence story turn-gated correctly; own-word entry is rejected; host scores each secret word's post-story surprisal and the reveal ranks players lowest-surprisal-first with all hidden words exposed.
