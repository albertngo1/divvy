## Overview

Blank Slate inverted: instead of trying to match your teammates' one-word answer to a prompt, you're trying to be the ONLY player who thought of your answer. Each round, a category prompt appears; everyone types privately; on reveal, an in-browser LLM (embeddings model) computes pairwise semantic similarity of all answers. Your score = your minimum distance from any other answer. Accidental convergence on a common word tanks two people at once. Load-bearing per-phone because private submission before reveal is the whole game — one shared screen destroys it.

## Problem

All group-word party games (Blank Slate, Just One, Codenames) reward convergence with teammates or specific targets. Nobody has built the inverse: rewarding *lateral thinking*, being the person who thought of the weird answer nobody else did. This is a genuinely different game feeling — smugly satisfying when you nail an off-axis answer, painful when someone else came up with your "creative" pick.

## How it works

Room code join, 3-8 players. Prompt appears ("things a grandma might have in her purse"). 30-second private typing window; each phone submits one word. Reveal: all answers displayed. Server (or each client) runs a small sentence-embedding model (transformers.js `all-MiniLM-L6-v2`, ~90MB) over each answer, computes pairwise cosine similarity. Each player's score = 1 minus their maximum similarity to any other player's answer. Highest wins the round. Multi-round session (5 rounds); cumulative score wins overall. Tension escalates as prompts get more specific and unique answers get harder to find.

## Technical approach

PartyKit / Durable Objects for room state. Room state = `{prompts, answers: {player_id: word}, similarity_matrix, scores}`. Client loads embedding model on join (one-time ~90MB, cached via Service Worker). On reveal, each phone independently computes embeddings for all answers + pairwise cosine similarity; server takes median of all clients' matrices (guards against tampering, though there's no strong incentive to cheat given no leaderboard). Prompts hand-authored (~30 for v1) with a good mix of categories.

## v1 scope

5 rounds, 4-6 players, 30 hand-authored prompts, single fixed embedding model (all-MiniLM-L6-v2), score = round wins summed. No difficulty tiers, no custom categories, no persistent leaderboard, no adaptive prompt selection. Web only, iOS gesture required for LLM download permission.

## Out of scope

Custom prompt packs, difficulty modes, per-round LLM model swap, adjustable similarity threshold (score is deterministic from cosine), spectator scoring visualization, LLM-generated prompts, streak scoring, tournament mode. Also excluded: sentence-length or n-gram scoring; word only in v1.

## Risks & unknowns

Embeddings model download is 90MB — friction on cellular. If it fails to load on a phone, that player has to sit out or v1 needs a server-side fallback ($.0005/round via a cheap embedding API). Similarity thresholds may need tuning — cosine 0.7 between two answers may or may not FEEL "matched" depending on prompt. Playtest question: is "being the weird one" satisfying, or does it feel arbitrary? The unlock is when someone plays a wild card that lands as high-scoring — that "OH THAT'S SMART" reaction. If prompts are too easy, everyone converges on common answers and it feels random; too hard and nobody comes up with anything.

## Done means

4 friends play a 5-round session, all embedding models load, and at least once someone scores a clear round win because they typed a legit-clever answer that nobody else touched. If they high-five over that round, v1 shipped.
