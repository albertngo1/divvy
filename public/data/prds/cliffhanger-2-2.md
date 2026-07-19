## Overview
Cliffhanger is a 3–6 player concurrent-room party game where each player privately crafts a short sentence *stem* — and is scored not on how the stem reads, but on how *uncertain* a small in-browser language model is about the very next word. The whole game runs off one number the model exposes for free: the entropy of its next-token distribution. Highest branching factor wins. For friends who like word games and enjoy poking at how an AI 'thinks.'

## Problem
Every perplexity party game so far scores whole sentences: min it, max it, hit a band. Nobody has played with the model's *forward uncertainty* — the moment where it genuinely has no idea what comes next. That's a distinct, funny skill: engineering a real cliffhanger. 'She opened the box and found a ___' branches wildly; 'The capital of France is ___' does not.

## How it works
The host TV shows one shared opening fragment for flavor (e.g. 'When the door finally opened,') and a 60-second timer. **Privately, each phone** shows a text box where the player extends that fragment into a grammatical stem that ENDS at a maximally-open decision point — they want the model, reading their stem, to consider a huge spread of plausible next words. Phones write blind; nobody sees anyone else's stem. On submit, each phone locally runs the model, computes the entropy (in bits) of the next-token distribution after the stem, and shows the player their own private 'branch meter' plus the model's top-5 guesses for the next word — so they can iterate before the timer ends. A grammar/length gate (min 4 words, must parse) blocks gibernish-farming.
At reveal, the **host screen** ranks all stems by authoritative entropy, and for each one theatrically fans out the model's top-5 next-word guesses — the winner is whoever left the model flailing across the widest spread of sensible continuations. Bonus 'the model actually said THAT?' laughs guaranteed.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Objects, or Socket.IO over Tailscale Serve). Model: distilgpt2 via transformers.js, loaded on both phones (for the live private meter) and host (for authoritative rescoring). Data model: `Room{code, fragment, phase, deadline}`, `Player{id, name, stem, entropyBits, top5}`. Sync: phones compute local entropy for responsiveness; only the final stem string is sent to the server, and the host recomputes entropy authoritatively so no phone can spoof its score. Hard part: entropy is a full-vocabulary softmax over 50k logits per submission — fine on host for N≤6 sequentially, but the phone-side live meter must debounce (recompute ~400ms after typing stops) to stay smooth on mid-range phones.

## v1 scope
- One round, 3–6 players, one shared fragment.
- Private stem authoring + local live branch meter.
- Host authoritative entropy ranking + top-5 fan-out reveal.
- Grammar/length gate.

## Out of scope
- Multiple rounds / scoring across rounds.
- Model choice, difficulty tiers.
- Guessing/deduction layers.

## Risks & unknowns
- Degenerate maxima (mid-sentence conjunctions like 'and the') may spike entropy cheaply — needs the end-at-a-noun-slot framing plus gate tuning.
- distilgpt2 entropy may not match human intuition of 'open-endedness'; playtesting required.
- Phone-side full-vocab entropy perf on old devices.

## Done means
Five phones each submit a stem; each phone showed a live branch meter that moved as they typed; the host displays an entropy-ranked list where the top stem's model top-5 next-words are visibly more varied than the bottom's, and the same ranking is reproducible on host rescoring.
