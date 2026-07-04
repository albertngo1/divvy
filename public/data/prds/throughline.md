## Overview
Throughline is a daily browser word game for the kind of person who falls down Wikipedia rabbit holes. Each day everyone gets the SAME two random articles (say *Cochineal* and *Byzantine navy*) and must write one true, coherent sentence that meaningfully bridges them. Shorter + more coherent wins. It turns aimless Wikipedia grazing into a competitive daily with a shareable score.

## Problem
Wikipedia is the ultimate passive-consumption trap — and, per the HN 'Odin, Wikipedia and engagement farming' thread, increasingly optimized for idle scrolling. Meanwhile 'Synthesis is harder than analysis' (also front page) nails the real skill nobody practices: connecting distant ideas. There's no daily ritual that rewards synthesis the way Wordle rewards vocabulary.

## How it works
1. A date-seeded PRNG picks two article titles from a curated pool of ~20k 'notable enough' pages.
2. You read both (embedded summaries) and type a single sentence.
3. Scoring = coherence × brevity × truth. Coherence: a small in-browser LM scores how well the sentence is entailed by both articles. Brevity: fewer words = more points, hard cap ~30. Truth: every claim's key nouns must appear in at least one of the two article bodies (cheap grounding check).
4. You get a par score (precomputed by the author) and a shareable 🟩🟨 rating of how your sentence ranked. Global leaderboard resets at midnight UTC.

## Technical approach
Pure static site (Vite + TypeScript), no backend for v1. Article pool + daily summaries prebaked into a JSON shard via the Wikipedia REST API (`/page/summary`, `/page/related`). Coherence scoring runs client-side with transformers.js — a small NLI model (e.g. a distilled MNLI checkpoint) computing entailment probability of the user's sentence given each article summary as premise; final coherence = geometric mean of the two entailment scores. Brevity is trivial token count. Truth-grounding: tokenize the sentence, require ≥N content-word overlaps with the union of article bodies (blocks pure hallucination). Leaderboard via a tiny serverless KV (Cloudflare Workers KV) keyed by date. The genuinely hard part is anti-gaming: stopping degenerate 'X and Y both exist' filler — solved by requiring a shared non-stopword ENTITY that appears in both articles, forcing a real bridge.

## v1 scope
- One daily puzzle, fixed 2 articles
- Client-side NLI coherence + word-count brevity + overlap truth check
- Emoji share string, no accounts
- Static leaderboard of top 20 sentences

## Out of scope
- User accounts, streaks, archives
- Multi-hop (3+ article) chains
- Full fact-checking beyond token grounding

## Risks & unknowns
- In-browser NLI may be slow on mobile (~1–2s/eval; acceptable)
- Gaming the scorer with LM-flattering phrasing
- Curating a pool that yields fun, solvable-but-not-trivial pairs

## Done means
On two devices at the same date seed, both see the same two articles; a well-crafted 12-word bridge scores higher than a 25-word rambling one and a nonsense sentence; the share string copies to clipboard and the top-20 board updates within 2s of submit.
