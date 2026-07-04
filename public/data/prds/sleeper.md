# Sleeper

## Overview
One player is a Sleeper Agent secretly given a codeword they must smuggle into an unrelated group discussion. All other players are trying to catch the codeword being smuggled. After the discussion ends, everyone votes on (a) who the Sleeper was, and (b) what their codeword was. Simpler than Back-Channel (1 smuggler vs group) but has a cleaner social dynamic — one person trying to slip a word past everyone else. Per-phone is load-bearing because Sleeper's codeword must be private; single shared screen breaks the mechanic.

## Problem
Same steganography-gap as Back-Channel, but at a lower complexity bar for social groups. Not everyone can invent an encoding scheme; almost everyone can try to slip one word past their friends. The genre lets a specific kind of low-key player shine (the quietly clever one who lands the codeword without anyone noticing).

## How it works
Room code join, 4-8 players. Setup: server picks a random discussion topic ("best breakfast foods", "the worst dating advice you've heard") + random Sleeper + random codeword (an unusual word: "pomegranate", "meridian", "gerbil"). All phones show topic; Sleeper's phone additionally shows codeword privately. 5-minute open discussion (voice or typed chat, group's choice). Sleeper must say/type the codeword naturally within the discussion; others try to catch the moment it's smuggled without derailing the topic. After timer, everyone privately submits (a) their guess for Sleeper's identity, and (b) their guess for the codeword. Reveal: Sleeper scores if uncaught OR if fewer than half correctly identified the codeword. Non-Sleepers score for each correct guess.

## Technical approach
PartyKit / Durable Objects. Room state = `{topic, sleeper_id, codeword, discussion_log, guesses: {player_id: {sleeper: id, codeword: str}}}`. Discussion is voice-based by default (no mic monitoring needed) with optional chat log for typed play. Codeword library: ~200 hand-authored uncommon words (specific enough to be noticeable if forced, common enough to be plausibly said in normal conversation). Topic library: ~30 open discussion prompts.

## v1 scope
5 players, 5-min discussion (voice, group tracks manually), 1 topic + 1 codeword per session, single guess phase, no chat log persistence. Score = Sleeper wins if fewer than 50% of guesses are correct; non-Sleepers each score 1 per correct guess. No difficulty tiers, no theme selection.

## Out of scope
LLM validation of "was the codeword actually said?", speech-to-text codeword detection (v1 is honor-system voice), multi-sleeper rounds, adaptive codeword difficulty, topic voting, chat archival, replay of the discussion.

## Risks & unknowns
Voice-only relies on honor system — Sleeper could claim they said the codeword when they didn't. May need a "tap to confirm you said it" button on Sleeper's phone (private, self-reported). Codeword difficulty is critical: too common (like "table") and it comes up naturally; too rare (like "quinquagenarian") and Sleeper can't work it in. The word list is real curation labor. Playtest: does the 5-min timer keep things tight, or does it drag? Adjust to 3-4 min if pacing lags. Some groups may reject voice-based mechanics (introverts, remote play) — chat mode is a v1.1 must-have.

## Done means
5 friends open the room, one becomes Sleeper, group discusses the topic for 5 min. Sleeper attempts to smuggle the codeword; at reveal at least one non-Sleeper correctly identifies the codeword AND at least one guesses wrong. If the group cracks up over "WAIT — you said pomegranate about breakfast??" — v1 shipped.
