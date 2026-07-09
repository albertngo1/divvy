## Overview
On the Nose is a Jackbox-shaped party game for 3–8 players where a tiny in-browser language model is the entire judge. A shared host screen (TV/laptop) shows a public sentence stem; every player's phone is a private writing pad. The joke is that you're all trying to be *unoriginal* — to write exactly what the machine expects — while dodging everyone else who's trying to do the same.

## Problem
Most writing party games reward being funny or weird, which is subjective and favors the loud. On the Nose flips it: 'be the most obvious' is a crisp, machine-scorable target that still creates delicious tension, because obviousness is a crowded lane and collisions are penalized.

## How it works
Host screen shows a stem, e.g. "The detective opened the door and saw ___". Each phone PRIVATELY shows the same stem plus a text box and a countdown; players type a 3–6 word completion. Nobody sees anyone else's draft. On submit, the host's model computes each completion's perplexity (how unsurprised the model is). Lowest perplexity = 'most on the nose' = most points. THE TWIST: if two submissions are near-identical (normalized string match in v1), both are voided to zero — so the safest predictable answer is also the most dangerous. Host screen dramatically reveals completions sorted by a 'surprise meter', calling out collisions with a buzzer. Private phones then show your personal score and a one-line roast from a canned list.

## Technical approach
Host browser runs transformers.js with a quantized distilgpt2. Phone PWAs are thin clients: they send `{playerId, text}` over WebSocket to an authoritative server (PartyKit or Socket.IO over Tailscale Serve). Data model: `Room { stem, phase, players: [{id, name, submission, perplexity, voided}] }`. Sync: phones POST submissions; server gates on all-in-or-timeout, then signals host to score; host posts back perplexities; server broadcasts the reveal. Perplexity = exp(mean token NLL) over the completion tokens only. The genuinely hard part is that scoring is centralized on the host (phones can't run the model), so the host tab must stay alive and finish ~8 forward passes within a snappy reveal window; we warm the model at lobby time and cap completion length.

## v1 scope
- One round, one hardcoded stem.
- 3–5 players, names only, no accounts.
- Perplexity scoring + exact-match collision voiding.
- Host reveal with a single sorted 'surprise meter' bar chart.

## Out of scope
- Multi-round scoring, semantic (embedding) collision detection.
- Custom/generated stems, spectators, reconnection.
- Mobile polish beyond a textbox and a timer.

## Risks & unknowns
- In-browser model latency on a weak host machine.
- Perplexity can reward degenerate short/common answers — may need a min-token floor.
- Exact-match collisions may be too rare with free text; watch playtests.

## Done means
Five phones join a room, all submit to one stem, the host screen shows completions ranked by perplexity with at least one collision correctly voided to zero, and every phone displays its own rank — all within one page load, no reruns.
