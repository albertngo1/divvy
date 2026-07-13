## Overview
House Rules is a 4–6 player deduction game where the divergent secret isn't the DATA — it's the RULES. Everyone sees the identical board on the TV. Everyone's phone holds a short private rulebook. One rulebook has a single rule swapped, and the imposter, scoring in good faith, arrives at a total that doesn't match the room.

## Problem
Hidden-role games usually give the imposter secret information. But the funniest arguments in real board games are about rules disputes — two people certain they're playing the same game, scoring it differently. House Rules weaponizes that: the imposter isn't cheating, they genuinely believe aces are low.

## How it works
The shared screen shows one fixed 'position' — say five face-up cards, or a 4x4 token grid. Each phone PRIVATELY displays a 3-rule scorecard, e.g. 'Pairs = 3pts / Longest run = 2pts each / Red beats black on ties.' The crew's cards are identical; the imposter's has ONE rule replaced with a near-twin ('Longest run = 3pts each'). Nobody is told they might be the odd one.

Each player privately computes the position's score and submits (a) their number and (b) which single rule earned the most points. The host reveals all numbers at once. Crew scores cluster; the imposter's is an outlier — but only if the swapped rule actually bit on this board, so the imposter must pick 'which rule mattered' to expose themselves further. Group discusses the gap ('why did you get 11?'), then votes one phone. Reveal shows the two rulebooks side by side with the swapped line highlighted.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve or PartyKit). Data model: `Position { cards[] }`, `Rulebook { rules: [ruleId] }`, `imposterId`, `submissions: {playerId → {score, topRuleId}}`. Server owns the canonical position, deals identical rulebooks to crew and a one-line-swapped variant to the imposter, and — critically — verifies each swap actually changes the score on the chosen position (rejects positions where the swap is a no-op). Sync is light: state set once, submissions and votes stream. Hard part is content design: a rules-and-positions library where each swap is (a) plausible, (b) numerically decisive on that board, and (c) not so obvious the imposter notices. v1 hand-tunes 5 position/rulebook pairs.

## v1 scope
- One round, 4 players, one position + one pre-vetted rule swap
- Private per-phone rulebook + score/top-rule submission
- Simultaneous reveal, one group vote, side-by-side rulebook reveal
- Room code join

## Out of scope
- Player-authored rules, multi-round scoring
- More than one imposter or multiple swaps
- Live rules-engine for arbitrary card games

## Risks & unknowns
- Does the swapped rule reliably produce a catchable outlier without being obvious?
- Slow-math players may stall the round — needs a tight position
- Might feel like a math quiz rather than a social game

## Done means
4 phones show private rulebooks (3 identical, 1 single-rule-swapped), all score one shared position, the imposter's total is a verified outlier on that board, and in playtests the crew catches them above chance while the imposter insists they scored it correctly.
