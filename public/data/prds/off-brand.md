## Overview
Off-Brand is a quick multiplayer party game (phones-as-buzzers, one shared screen) for 3–8 people. Each round shows an ordinary object — a brick, a paperclip, a shoelace — and players race to type an unusual *use* for it. The twist: you don't win by being 'good,' you win by being **un-LLM-like**. An LLM judge scores each answer by how *improbable* it is under the model's own distribution. The obvious answers are worth nothing; the weird, human, sideways ones win.

## Problem
The arXiv 'Two-player Alternate Uses Test' framed human-AI co-creativity as a testbed, and there's a growing itch (Drew DeVault's AI-free Vim, 18 Words' minimalist charm) for play that celebrates the *human* against homogenized model output. A straight AUT app is a research toy; nobody's made the mischievous party version where beating the model's blandness *is the game*.

## How it works
1. Host starts a room; players join via URL/QR. 2. An object prompt appears; 60-second timer. 3. Everyone submits one alternate use. 4. Scoring: each answer is scored by the model's token-level surprisal (or a rubric prompt: 'rate how obvious/expected this is, 1–10') — *lower expectedness = more points*, with a validity gate so nonsense ('use a brick to teleport') gets zeroed. 5. A bonus 'Off-Brand' round: the model itself submits a decoy answer; players who match its predictability lose points; the human whose answer is furthest from the model's wins the round. Reveal screen shows the model's own top-3 boring answers for laughs.

## Technical approach
Node/Bun + WebSocket for rooms; Svelte front-end; QR join. Judge via Claude API: for each submission, one call returning `{valid: bool, expectedness: 0-10, oneLineReason}` in a batched structured-output request per round (cheap, one call scores all answers). If a logprob-capable endpoint is available, use real token surprisal for the score instead of a rubric — cleaner and harder to game. Object prompts are a curated list of ~200 everyday items. The hard part: an anti-gaming validity gate (players will try 'a paperclip could be a quantum antenna') and keeping judge latency under ~3s so the reveal feels snappy — solved by batching all answers into one prompt and streaming.

## v1 scope
- Room create/join via QR, 3–8 players
- One object per round, 60s timer, 5 rounds
- Single batched Claude call scoring validity + expectedness
- Reveal screen ranking least-expected → most-expected

## Out of scope
- Accounts, persistent stats, the model-decoy bonus round (v2)
- logprob scoring if endpoint unavailable — rubric fallback
- Custom object packs

## Risks & unknowns
- Rubric scoring may be noisy/inconsistent round-to-round; logprobs are better but not always exposed
- Players gaming the validity gate with confident nonsense
- Judge cost/latency at 8 players — batching should hold it to one call/round

## Done means
Five people in a room can play a full 5-round game on their phones, every submission gets a validity+expectedness score within 3s of the timer ending, the least-expected valid answer wins each round, and blatantly invalid answers score zero.
