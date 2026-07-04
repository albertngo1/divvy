## Overview

Assigned pairs must each independently type the same word from a category — with zero communication. Prompt: "a red thing". You and your partner each type one word on your own phone, blind. Match = point. Miss = zero. Play multiple rounds with rotating pairs. It's the Mind-Meld drinking game (or Mindbender) formalized: think about your partner's brain until you converge. Per-phone is essential — each pair submits privately and simultaneously; a shared screen destroys the mechanic instantly.

## Problem

Mind-Meld / psychic-partner games are a party staple but usually require an outside moderator, a countdown, and hand-shielding. Nobody's built the elegant per-phone version where the pairs are auto-assigned, the prompts scale, and the reveal is instantly gratifying. Requires per-phone architecture: private submission, synchronized reveal, and shifting pair assignments each round.

## How it works

Room code join, 4-8 players (must be even; odd players sit one round out or the moderator plays). Server pairs players randomly per round. Prompt appears on all phones ("name a red thing", "a movie villain", "a food you eat with your hands"). Both partners type one word within 15s. On timer expiry, reveal shows each pair's two answers side by side; exact match (normalized) = +1 to the pair; stem match = +0.5; miss = 0. 8 rounds, re-pair between rounds. Team leaderboard at end.

## Technical approach

PartyKit or Socket.IO. Room state = `{round, pairs: [[p1, p2], ...], prompt, answers: {player_id: word}, results}`. Pair assignment: random shuffle each round, no repeat pairs until all combinations exhausted. Match logic: normalize (lowercase, trim, punctuation strip) → exact match, else Porter stem match → half-point. Prompts drawn from ~80 hand-authored categories. No LLM in v1.

## v1 scope

8 rounds per game, 4-6 players, 80 hand-authored prompts, random pair rotation with no-repeat constraint until pool exhausted. 15s per round for typing, 5s reveal per pair. Score: +1 exact, +0.5 stem match, 0 miss. Leaderboard at end. No LLM prompts, no LLM semantic match, no custom prompts, no odd-count handling beyond sit-out.

## Out of scope

LLM semantic matching (e.g. "tomato" ≈ "cherry"), custom prompt submission, LLM prompt generation at runtime, spectator mode, odd-count solutions (auto-add bot partner), themed prompt packs, all-pairs simultaneous scoring.

## Risks & unknowns

Match strictness has the same trade-off as Chorus — too strict frustrates when "apple" ≠ "Apple", too loose loses the psychic-match spark. Stem match half-point is a reasonable middle. Second: random pair rotation may pair strangers who have no shared reference frame — could be frustrating for mixed groups (families + strangers). May need "friend groups" opt-in in lobby. Third: the game gets stale after ~8 rounds because prompts overlap in vibe — 8 hand-authored categories per session is likely the right upper bound.

## Done means

4 friends play 8 rounds. At least one pair scores an exact match on a non-obvious prompt (feels psychic). One pair completely whiffs on a "should have been easy" prompt (feels funny). Group asks to shuffle pairs and play again.
