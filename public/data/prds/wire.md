## Overview

Each phone secretly holds one word. One player is the Editor. The Editor improvises a spoken sentence out loud, live, that has to use every player's secret word in a designated order (going around the circle). As the Editor speaks, they tap a "hit" button when they've used a word; that word types out live on every phone in the shared sentence view. Group cheers, groans, or scores based on whether the sentence made sense. Per-phone is load-bearing because each word is private to its holder until the Editor lands it — the reveal moment IS the fun.

## Problem

Improv comedy games work in person but don't survive digital adaptation because the reveal ("your word was 'linoleum'") requires private holding + coordinated public reveal. Existing digital word games either show all words to all players (kills surprise) or route through one moderator (kills the pace). Per-phone architecture unlocks a fluid version: everyone holds a private card, everyone watches the sentence type out in real-time as the Editor works.

## How it works

Room code join, 4-7 players. One player is designated Editor. Each other player is dealt one random word (private on their phone) and is assigned a position in the sentence (1st, 2nd, 3rd…). Order is displayed to the Editor as anonymous slots. Editor speaks a sentence out loud and taps "hit" on their phone each time they land the current word. On tap, the current word reveals on all phones in the shared sentence view. Continue until all words hit. Timer: 90s. Group votes 1-5 stars on how good the sentence was. Rotate Editor.

## Technical approach

PartyKit or Socket.IO. Room state = `{round, editor_id, slots: [{position, player_id, word, hit}], sentence_display, timer, ratings}`. Word bank hand-authored (~500 words across noun/verb/adjective, weighted for improv-friendliness — concrete, punchy, weird). Editor's phone shows slot positions but not words; other phones show their own word privately + shared sentence view live-updating on each hit. No STT — Editor manually taps "hit" (respects offline / mishears / ambient noise).

## v1 scope

Each player gets one turn as Editor per game (so 4-6 rounds), 4-6 players, ~500 hand-authored word bank, one word per non-Editor per round. Round: 90s to hit all words. Score: average 1-5 stars from group after each round; running leaderboard. No STT auto-hit, no LLM word generation, no theme categories, no re-order mid-round.

## Out of scope

Speech-to-text auto-hit, LLM word generation at runtime, theme/category filtering, difficulty modes (harder word banks), spectator mode, save-and-share sentence transcripts (nice-to-have), multi-Editor rounds.

## Risks & unknowns

Word bank quality dominates fun — improv-friendly words (concrete nouns like "raccoon", verbs like "confess") work; abstract words ("existence") don't. Weekend of curation needed. Second risk: the "tap hit" flow may distract the Editor from improv — need to test if a big obvious button on the Editor's screen is fine or if it kills flow. Third: audio isn't networked (players are co-located or on their own voice channel), so this only works when the group is in the same room or on Discord/Zoom — probably fine for target use.

## Done means

4 friends play 4 rounds (one Editor each). At least one sentence ends in genuine laughter. Any Editor delivers a sentence containing "banana", "confess", and "linoleum" in some grammatical order.
