## Overview

A per-phone reimagining of *Anomia*. Two players' phones simultaneously reveal a random category card ("things you find in a kitchen", "80s bands"). If any of the currently-visible categories on any two phones share a match (same category, or one is a subset), those two players race to be the first to shout a valid example. Fastest voice wins the point; loser draws again. Continuous simultaneous card flipping across the whole room creates cascading duels. Per-phone matters because each player must have their own active card face-up at all times, in a way one shared device can't do.

## Problem

Physical Anomia is fast, chaotic, and beloved — but the physical setup (deck of cards, everyone flipping and watching for matches) is fiddly. Existing digital versions of Anomia-adjacent games are turn-based prompt→answer and lose the concurrent-flipping chaos. The per-phone-as-active-card metaphor solves the physical setup while preserving the exact chaotic feel — everyone has a live card face-up on their own phone at all times.

## How it works

Room code join, 4-8 players. Each phone displays one visible "card" (a category like "types of pasta"). On countdown, all phones flip to their first category. The room state tracks currently-visible categories; whenever any two players' current cards match (same category, or one is a subcategory), the server broadcasts a "DUEL" event to those two players (phones vibrate, category highlighted). The two dueling players race to say an example out loud. First player to have their voice detected (mic amplitude spike + speech-to-text validation) wins the point; winner and loser both draw new cards. Meanwhile others may have other duels open. Session = ~5 min or first to 10 points.

## Technical approach

PartyKit / Durable Objects. Room state = `{cards: {player_id: category_id}, active_duels: [{p1, p2, category}], scores}`. Category deck hand-authored with ~200 categories, some tagged as subcategories of others. Speech detection = mic amplitude threshold (250ms voice ≥ 55dB) + short Web Speech API recognition to confirm it's a plausible word (falls back to "first voice wins" if API unavailable). Server maintains "current card" per player; when a card change causes a new match, server marks a duel active; when someone "buzzes" (via voice detection or manual tap-to-claim button), it awards the point and triggers card redraws for both.

## v1 scope

4-6 players, one deck (~50 hand-authored categories), simple exact-match logic (no subcategories in v1), 5-min timer, tap-to-buzz (no voice detection in v1 — get the loop shipping first; voice as v1.1). Score = first to 10 or highest at timer. No difficulty tiers.

## Out of scope

Speech-to-text validation, subcategory matching ("italian dishes" ⊂ "european food"), custom category decks, spectator view, streaming scoring reveal, adaptive difficulty. Voice detection deferred to v1.1 because it's the single biggest risk (accuracy, mic permission, noise floor) — ship tap-to-buzz first.

## Risks & unknowns

The whole game hinges on the *feel* of "two people just noticed a match at the same time" — needs snappy vibration + highlight to sell it. Categories will be a lot of hand-curation. Voice detection deferred to v1.1 but is the endgame — tap-to-buzz will feel like a placeholder to Albert's playtest group. Chance of multiple simultaneous duels across the room becoming confusing to track; may need a "pause other duels while one resolves" rule, or accept the chaos as the point.

## Done means

4 friends open the room, everyone gets a category card, and across a 5-min session the group has at least 5 duels where two players simultaneously go "OH!" and race to answer. If the room gets loud, v1 shipped.
