## Overview
Seed is a 4-6 player calibration game where the goal isn't to be weirdest or blandest — it's to hit a SECRET ordinal rank of weirdness. Each phone is privately assigned a target position (e.g. 'land 3rd-most-surprising of 4'), and you must steer your own sentence's perplexity to hit that exact slot, blind to everyone else. For groups who like the delicious agony of aiming for the middle.

## Problem
Every perplexity game so far rewards an extreme — flattest wins, or most-surprising wins. That collapses into a single strategy. The untapped itch is CALIBRATION under social uncertainty: hitting a specific target rank means modeling both the language model's reaction AND how weird your opponents are likely to go — which you can only do blind. That double-guessing is the whole game, and it dies instantly if one phone is passed around because you'd see everyone's answers.

## How it works
Host screen shows a shared, harmless prompt stem: 'The office party was ruined because ___.' Every phone gets the same stem.

PRIVATE per phone: your secret target rank ('You must finish #2 weirdest of 4'), a text box, and — this is the only feedback — a private 'calibration dot' showing where your CURRENT draft's perplexity sits on an unlabeled 0-100 strangeness bar (the model's raw surprisal, normalized). You see your own dot move as you type; you never see anyone else's dot or draft. You lock in once.

SHARED host screen: the stem, a countdown, and after lock-in a dramatic reveal — all sentences sorted by perplexity into a weirdness ladder, each tagged with the author's SECRET target, and a score = how many rungs off-target you landed (0 = perfect).

Lowest total distance wins. The comedy: two people both aiming for '#2' collide, someone aiming for 'blandest' accidentally writes the weirdest thing.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). distilgpt2 via transformers.js runs on the HOST tab only.

Data model: `Room { stem, players[] }`; `Player { id, targetRank, draft, locked, finalPerplexity }`. As a player types (debounced ~400ms), the phone sends `preview {text}`; the host queues a forward pass and returns ONLY that player's normalized dot position privately. On lock-in the host computes final perplexity for all, sorts, assigns actual ranks, and diffs against each secret target.

Sync strategy: server authoritative; host is the privileged model-owning client. Hard part is normalization — raw perplexity for a live-typed fragment is noisy and unbounded, so the 'strangeness bar' needs a stable squashing (e.g. map log-perplexity through a fixed sigmoid calibrated on a corpus of sample sentences) so the private dot is meaningful before other answers exist. Getting that mapping honest — so a dot at 70% really is 'pretty weird' — is the real work.

## v1 scope
- 4 players, one round, one hand-picked stem.
- Secret target ranks dealt as a fixed permutation of {1,2,3,4}.
- One lock-in per player; live private dot; host-side sort + off-by-N scoring.
- distilgpt2 on host, phones thin.

## Out of scope
- Multiple rounds, cumulative scoreboards, player-authored stems, 5-6 player rebalancing of target sets.

## Risks & unknowns
- The normalized dot might not predict final rank well once real opponents exist, making calibration feel random rather than skillful.
- distilgpt2 may not spread four short sentences cleanly enough to yield distinct ranks (tie-heavy).
- Players could ignore targets and just write jokes; needs the reveal to sting enough to matter.

## Done means
Four phones share a stem, each holds a distinct secret target rank, each sees a live private strangeness dot while typing, lock in one sentence, and the host renders a weirdness ladder that reliably places sentences by perplexity and scores each player by rungs-off-target — with a perfectly-calibrated player scoring 0 and winning.
