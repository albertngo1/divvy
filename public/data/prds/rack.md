## Overview
Rack is a 3–6 player concurrent-room party game about constraint. Each phone is dealt its own secret hand of random content words; under a timer you assemble one grammatical sentence using only your hand (plus free function words), racing everyone else to the *lowest* perplexity. Your material is fixed, private, and unfair — that's the fun.

## Problem
Free-writing perplexity games converge on the same safe clichés because anyone can write anything. The itch: give players *bad tiles* and watch them fight to make "otter, invoice, glacier, apology" sound like a sentence a model has seen a thousand times. The randomness is the comedy and the leveler.

## How it works
1. Server deals each player a PRIVATE hand of ~8 content words (nouns/verbs/adjectives) drawn from a wordlist; no two hands overlap.
2. Each phone PRIVATELY shows its hand and a builder: tap tiles in order, freely insert function words (the/a/of/and/is…). Host TV shows only names, a timer, and "building…" dots — never anyone's hand or sentence.
3. On timer end, host runs each submitted sentence through distilgpt2 (transformers.js) for mean per-token perplexity. Grammaticality is human-refereed by a quick blind "real sentence? y/n" pass on each phone; failing majority zeroes you.
4. Host reveals sentences low→high perplexity with each author's hand shown beside it. Lowest valid perplexity wins.

Private-per-phone is load-bearing: hidden, unique, simultaneously-dealt hands can't be reproduced by passing one phone around, and the whole tension is not knowing whether your rivals got easier tiles.

## Technical approach
Host tab = display + model runner. Phones = PWA builder clients. Server = PartyKit / Durable Object (or Socket.IO over Tailscale Serve) holding `{roomId, phase, wordlist, players:{id,name,hand[],sentence,valid}}`. Dealing must guarantee disjoint hands (shuffle-and-partition server-side). Sync is light: hand pushed once at deal, sentence submitted once. Model runs only on host at scoring. The genuinely hard part is fair scoring across unequal hands — perplexity must be length-normalized (per-token) so a terse 5-word sentence doesn't beat a natural 9-word one on raw sum, and function-word insertion must be validated against an allowlist so nobody smuggles in extra content words.

## v1 scope
- One round, 3–6 players.
- Server deals disjoint 8-word hands from a fixed ~200-word list.
- Tile-tap builder + function-word allowlist on phone.
- distilgpt2 mean per-token perplexity on host; blind grammaticality vote; leaderboard with hands revealed.

## Out of scope
- Trading/discarding tiles, multi-round scoring, difficulty balancing of hands.
- Automated grammaticality checking (human vote in v1).
- Mobile inference.

## Risks & unknowns
- Disjoint hands may be wildly unequal in "buildability"; needs playtest and maybe curated pools.
- Length normalization vs. players gaming with ultra-short sentences.
- The grammaticality vote adds a step that could drag; must be one tap.

## Done means
Six phones join, each receives a distinct private 8-word hand, builds a sentence under a timer, and the host produces a correct length-normalized low→high perplexity leaderboard (with failing-grammar sentences zeroed) within ~3s — one round, one LAN, no reload.
