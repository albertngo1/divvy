## Overview

Everyone in the room reads a short news article on their phone — same headline, same byline, same length. One player (the Splinter) reads a version that's been subtly rewritten by an LLM: a name changed, a number shifted, one quote reworded, a cause-and-effect flipped. Group then discusses what they read — recapping details, arguing about implications — and votes on who read a different article. The Splinter's job is to blend in without giving away the tell. Per-phone is essential: the deception only works when each player's private screen can show a different text.

## Problem

Social deduction games mostly key off *identity* asymmetry (roles, teams) or *goal* asymmetry (mafia knows the townsfolk). Very few use *epistemic* asymmetry — where the disagreement is over what actually happened. Books and movies do this well ("Rashomon"), tabletop games can't because everyone reads the same card. Per-phone private screens unlock a genre of "we all read different truths and have to figure out who has the wrong one" games. Splinter is the smallest instance.

## How it works

Room code join, 4-8 players. Server picks a source article (~200 words, hand-curated). One player is randomly designated Splinter; their phone receives an LLM-rewritten variant. Everyone reads for 90s (timer visible). Then screens hide the article and the group discusses (typed chat or voice, group's choice) for 3-4 minutes. Someone can nominate a suspect; on nomination, everyone votes yes/no. If majority yes, reveal: was that the Splinter? Splinter wins by surviving one round; group wins by catching them.

## Technical approach

PartyKit or homelab Socket.IO. Server pre-generates variant pairs offline (Claude Haiku call: "Rewrite this article with exactly 3 factual changes: one name, one number, one causal claim. Keep tone and length identical."). Article library = `{article_id, canonical_text, splinter_text, changes: [description]}`. Room state = `{article_id, splinter_id, phase, chat_log, nominations, votes}`. Each phone receives canonical or splinter text based on role. Timer via server-side interval broadcasting tick messages.

## v1 scope

1 round per game, 4-6 players, 20 pre-generated article pairs (mundane topics — a local election, a sports trade, a science finding). Phases: 90s read, 4min discuss, 30s nominate+vote. Score: binary — Splinter escapes or group catches. No LLM generation at runtime, no voice, no custom articles, no replay showing diffs.

## Out of scope

Runtime LLM rewriting, voice chat, custom article submission, multi-round accumulating score, showing the diff during discussion, spectator mode, category selection.

## Risks & unknowns

Change subtlety is the whole game — 3 tiny changes might be uncatchable, 3 obvious changes are trivial. Need playtest to tune the "exactly 3 changes" prompt. Also unknown: does the group actually remember article details well enough to argue? Might need to allow re-reading during discussion (weakens the pressure but might be necessary). Third: LLM-rewritten prose has tells (cadence, word choice) — may need human editing pass on all 20 variants before ship.

## Done means

4 friends read, discuss, vote. Someone confidently accuses the wrong person at least once. Group either catches Splinter or Splinter escapes convincingly — either outcome, the room says "one more".
