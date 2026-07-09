## Overview
Blackout is a 3-5 player cooperative word game where a real paragraph is shown with several words redacted, and each phone is privately assigned *one specific blank*. Everyone fills their own blank at the same time, blind to what the others are writing. When the reveal hits, a small in-browser LLM computes the perplexity of the reconstructed paragraph and compares it to the original author's — the team wins if their patched-together sentence is as unsurprising (as fluently 'inevitable') as the real thing.

## Problem
Exquisite-corpse games are fun but have no objective judge — you argue about whether it 'works.' The itch: a machine that can actually measure coherence, plus the specific tension of owning a hidden piece of a shared sentence and having to guess a word that will harmonize with words you can't see.

## How it works
Host TV shows the full paragraph with every blank as a black bar ("The ▮ curled up on the warm ▮ and refused to ▮"), a big perplexity meter, and the original author's perplexity as a target line — never anyone's guesses.

Each PHONE privately shows the same paragraph, but with YOUR blank highlighted and editable; the other blanks stay as bars you cannot fill or see. You type one word for your slot only. You can see the surrounding real words, so you have context — but not your teammates' choices. Everyone submits simultaneously.

On reveal, the host substitutes all guesses, animates the sentence filling in, and drops the reconstructed-perplexity needle against the original line. Beat or match it → co-op win; wildly higher → the sentence 'reads wrong' and you lose. The comedy is in the collision ("warm *lava*" + "refused to *evaporate*").

## Technical approach
Host browser tab runs distilgpt2 via transformers.js as the authoritative scorer. Phone PWAs connect over a WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: room {code, passage, blanks:[{idx, trueWord, ownerId}], origPpl, phase}; submission {blankId, word}. Sync is a simple barrier: host assigns each blank to a distinct player at start, phones send one {type:'fill', blankId, word}, host waits for all blanks, substitutes, runs one forward pass to compute the reconstructed paragraph's perplexity, then broadcasts the reveal.

Hard part is lighter than a real-time game (single scoring pass, not a stream), so the real work is authoring good passages: sentences with genuinely constrained blanks where a wrong word spikes perplexity noticeably. Pre-tokenizing and caching original-passage log-probs keeps reveal instant.

## v1 scope
- One paragraph, 3 players, 3 blanks (one per player), one round.
- distilgpt2; full-passage perplexity vs. cached original.
- Simple pass/fail against original perplexity + a small tolerance.

## Out of scope
- Multiple rounds, blank-count scaling, per-player scoring.
- Passage authoring UI; blanks are hand-picked in v1.
- Handling more players than blanks.

## Risks & unknowns
- Whether reconstructed-vs-original perplexity is a satisfying, legible win condition or feels swingy.
- Passage curation is the whole game; bad blanks make it trivial or impossible.
- Small model may reward blandness over 'correct-sounding.'

## Done means
Three phones in a room each privately own and fill one blank of the same paragraph without seeing the others' words, and on reveal the host substitutes all three, shows the reconstructed perplexity against the original author's line, and declares a co-op win or loss — with each phone having only ever been able to edit its own assigned blank.
