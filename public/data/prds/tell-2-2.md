## Overview
Tell is a concurrent-room party game (host TV + phone PWAs) built on the *gap* between human surprise and a tiny language model's surprise. Everyone knows what reads as weird to a *person*; almost nobody can predict what reads as weird to distilgpt2. Tell makes that divergence the whole game. For 3–6 players who like bluffing and word puzzles.

## Problem
Most perplexity party games ask you to minimize or maximize the model's surprise directly. That's a solo optimization. The genuinely social itch is *misalignment*: a word can look like an obvious plant to your friends while the model shrugs at it. Nobody has a game where you exploit human-vs-model perceptual mismatch.

## How it works
1. **Authoring (private, simultaneous).** The host TV shows one bland stem, e.g. "The committee met on Tuesday to discuss the ___ budget." Each phone privately types ONE word to drop into the blank (or a specified insert slot). Your goal: pick a word that a human reader finds *strange* but that the model finds *low-surprisal* in context — a buried landmine. All words are hidden from the room and from each other.
2. **Gauntlet (shared).** The host assembles each completed sentence and, one at a time, displays it in plain text on the TV — but reveals NO surprisal numbers yet. Under the hood distilgpt2 has already scored per-token surprisal for each.
3. **Betting (private, simultaneous).** For each sentence (author excluded), every other phone privately taps the single word they believe the model was *most* surprised by. Simultaneous, blind.
4. **Reveal & score.** The host lights up the true max-surprisal token as a spike on the sentence.
   - **Author** scores big if their inserted word was NOT the model's top spike (they buried it) AND at least one bettor wrongly tapped their word (humans thought it was the trap). Perfect crime = misdirection + camouflage.
   - **Bettors** score for correctly tapping the real spike.

Private per-phone state is load-bearing twice: the hidden simultaneous authoring, and the hidden simultaneous betting. A passed-around phone collapses both.

## Technical approach
Host browser tab loads distilgpt2 via transformers.js and is the authoritative scorer. Phone PWA clients connect over WebSocket (PartyKit / Cloudflare Durable Object, or Socket.IO behind Tailscale Serve). Data model: `Round { stem, insertSlot, entries: {playerId, word}[], scores }`; per sentence the host stores `tokens[]`, `surprisal[]`, `maxIdx`. Sync: phones POST word, then POST bet `{sentenceId, tokenWordIdx}`; host broadcasts phase transitions. The genuinely hard part is **token↔word alignment**: distilgpt2's BPE tokens don't map 1:1 to whitespace words, so the host must group subword surprisals back into displayed words (sum or max over the group) so a bettor's tap on a *word* compares correctly to the model's per-*token* spike.

## v1 scope
- 3–6 players, exactly ONE stem, one gauntlet pass.
- Single blank/insert slot per sentence.
- Bet = one tap per sentence; flat scoring, no wager sizing.
- Host-provided stem list of ~10, picked at random.

## Out of scope
- Multi-word inserts, multiple rounds, wager sizing.
- Semantic/grammar validation of inserted words.
- Any model bigger than distilgpt2 or server-side inference.

## Risks & unknowns
- distilgpt2 spikes may be *too* legible after a few rounds, killing the bluff. Mitigate with stems that create genre expectations.
- Subword grouping edge cases (rare word split into 4 tokens) may distort the displayed spike.
- Author scoring balance (misdirection vs camouflage) needs playtest tuning.

## Done means
Five phones join from a QR code; each submits a hidden word; the host renders each sentence, collects hidden bets, reveals the true surprisal spike, and shows a correct leaderboard crediting buried-landmine authors and accurate bettors — all in one round under two minutes.
