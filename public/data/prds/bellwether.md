## Overview
Bellwether is a 3-6 player concurrent-room game riffing on Herd Mentality, for groups who like a light social-deduction knife hidden inside a cozy "just agree with everyone" game. The host TV is the shared pasture; each phone is a private stall.

## Problem
Herd Mentality is delightful but toothless — matching the majority has no villain and no bluff. The itch is a hidden incentive that makes some innocuous answers suspiciously *off*, so the reveal is an accusation, not just a tally.

## How it works
The host shows one open prompt with a fat majority answer space: "Name a pizza topping," "A color of a school bus," "A month to get married." At round start the server secretly assigns exactly one player the **Bellwether** (contrarian) role.

PRIVATELY, each phone shows: the prompt, a one-line text box, and — only on the Bellwether's phone — a red banner: *"You win by being the ONLY player off the majority answer, without being caught."* Everyone else is told simply *"match the herd."* All players type simultaneously and lock in; nobody sees anyone's answer yet.

The host then reveals all answers as anonymized tiles and auto-clusters normalized matches (case/plural/synonym-folded, shown transparently). The **majority cluster** lights green. Herd players in that cluster are safe; anyone outside it is exposed as a possible Bellwether — including honest players who simply guessed weird.

Now every phone PRIVATELY votes for who they think the Bellwether was (self-vote forbidden). Scoring, three-way: the Bellwether scores big if they landed a *unique* minority answer AND dodged the plurality of votes; the herd scores if they correctly finger the Bellwether; honest outliers who got mis-accused are the comedy. The load-bearing privacy: the secret role, the simultaneous blind answers, and the secret votes cannot survive a single passed phone — seeing one screen leaks the role or an answer.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room{prompt, phase, players[]}`, `Player{id, role:'herd'|'bellwether', answer, vote}`. Phases: LOBBY → ANSWER (server-timed, all-locked or timeout) → CLUSTER → VOTE → REVEAL. Answer normalization runs server-side (lowercase, trim, singularize, small synonym map) and the clustering is shipped to the host as opaque groups so no client can reverse it early. Genuinely hard part: fair, legible clustering — the majority verdict must feel *earned*, so the host animates the fold rules and lets the room contest a merge before votes lock.

## v1 scope
- 3-6 players, exactly ONE round, ONE prompt.
- One hidden Bellwether, one answer phase, one vote phase, one reveal.
- Hardcoded prompt list of ~20; server-side normalization only.

## Out of scope
- Multi-round scoring, running totals, teams.
- Two Bellwethers, power roles, or clue chat.
- Learned synonym matching beyond a small static map.

## Risks & unknowns
- Honest weird answers muddy the deduction — tune prompts toward strong majorities.
- Normalization false-merges could unfairly hide the Bellwether; needs the contest step.
- With 3 players deduction is thin; 5-6 is the sweet spot.

## Done means
Five phones join, all answer blind simultaneously, the TV clusters and highlights the majority, every phone casts a private accusation, and the reveal correctly scores herd-vs-Bellwether — with no screen ever leaking a role or answer early.
