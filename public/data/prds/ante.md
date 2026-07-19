## Overview
Ante is a competitive 3–5 player silence-chicken game. The longer you stay perfectly silent, the larger your private, secretly-growing pot — but each phone feeds ITS owner a personalized, escalating stream of provocations designed to make *you specifically* laugh, gasp, or blurt. You may secretly cash out at any instant to bank what you've accrued. Crack before you cash, and your own phone's mic catches you and voids the pot.

## Problem
"Don't laugh" games collapse into one shared screen everyone watches together, with a human judge arbitrating who broke. Ante makes the temptation *private and asymmetric* (your dares aren't mine) and the decision *individual* (when to bank), so a single passed phone can't reproduce it — the whole tension is that nobody knows how fat your pot is or how close you are to breaking.

## How it works
All players start a round simultaneously. Each phone PRIVATELY shows: a growing pot counter (climbs ~1/sec while your local mic stays under a silence threshold, freezes when you make noise), a single big CASH OUT button, and a personal provocation feed — a drip of increasingly unhinged dares/images/prompts ("read this sentence out loud… go on") tuned to bait a reaction, escalating over time. Your phone's mic listens only to YOU: any vocalization above threshold = you cracked, pot voided, you're out.

The shared host TV shows only anonymized trembling bars (one per player, height = *time survived*, never the secret pot value) and a global "heat" clock that ratchets everyone's provocations hotter. Drama: cash out early and safe for a small pot, or gamble on the swelling pot while your phone throws worse and worse bait at you. Round ends when all have cashed or cracked; highest banked pot wins.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Model: `Player { id, potValue, status: live|banked|cracked, micRMS, provocationIdx }`, `Room { heatClock, bars[] }`. Each phone runs WebAudio AnalyserNode locally; RMS crossing a calibrated threshold for >200ms fires a `crack` event to the server (debounced against coughs — tunable). Pot accrual is server-authoritative (clients can't fudge). Provocation content is a per-player shuffled deck dealt at start so no two feeds match. Hard part: distinguishing a genuine vocal break from ambient noise fairly across devices — solve with a per-phone baseline calibration and a threshold set as baseline + delta, plus a brief grace on round start.

## v1 scope
- 3 players, one round
- Per-phone pot accrual + cash-out + own-mic crack detection
- One shuffled provocation deck of ~15 prompts
- Host bars (time-survived only) + heat clock

## Out of scope
- Multi-round matches, persistent scores
- Rich media provocations (text only in v1)
- Spectator/rejoin, anti-cheat beyond debounce

## Risks & unknowns
- Calibration: sensitive mics may false-crack on laughter-adjacent breath
- Whether hidden pot sizes create enough tension without a visible target
- Balancing accrual rate vs. provocation escalation so cash-out timing matters

## Done means
Three phones each accrue a private pot while their owner is silent, each shows a distinct escalating provocation feed, tapping CASH OUT banks the current pot, and any real vocalization above the calibrated threshold voids that phone's pot — with the host showing only anonymized survival bars and declaring the highest banked pot the winner.
