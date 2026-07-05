## Overview
A hidden-tribe clue game for 5-6 players riffing on The Chameleon. Two secret words silently split the room; nobody knows which side they're on or how big it is. For groups who love Chameleon's bluff-clue tension but want the paranoia turned symmetric — everyone could be the odd one.

## Problem
Chameleon is 1-vs-many: one imposter, everyone else shares the word, and once you confirm you *have* the word you're safe and just hunting the outsider. There's less game when you can't be sure YOU aren't the odd one. And a single passed phone can't hide each player's word from the others — private simultaneous words are the whole engine.

## How it works
Each phone privately shows one word. The room is secretly split — e.g. 4 phones read "LIBRARY," 2 read "COURTROOM" (thematically adjacent so clues overlap). You do NOT know the split size or which group you're in — only your own word. Going around, each player says ONE clue word aloud fitting their word, trying to (a) find teammates who clearly share it and (b) avoid outing themselves to the other tribe. After the clue round, everyone privately and simultaneously taps who they believe shares their word. The server scores: points for correctly identifying same-word allies, penalties for fingering the wrong tribe. Host reveals both words and the split.

Private per phone: your word, your tribe-guess taps. Shared host: room code, running list of locked clues, timer, final reveal + scores.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room {players[], wordPair, assignment:{playerId->word}, phase}`; `player {id, word, clue?, tribeGuesses[]}`. Server assigns words from a curated adjacent pair at a set split ratio and pushes each word privately. Phases: reveal → clue (sequential, host highlights whose turn) → guess (all phones unlock at once) → score. Sync is a simple phase barrier — server waits for all tribe-guess submissions, then computes. The genuinely hard part isn't latency; it's content — the word PAIRS must be close enough that a clue plausibly fits both (so bluffing works) yet distinct enough that tribes exist. That's a curated-data problem, plus never leaking any word onto the shared host screen.

## v1 scope
- 5 players, one round
- One hand-picked word pair, 3/2 split
- One clue each, typed into the phone and shown on host as it locks (avoids mishearing)
- Simultaneous private tribe-guess, then score + reveal

## Out of scope
Multiple rounds, adjustable split, a true lone-chameleon mode, accusation voting, an automatic word-pair generator.

## Risks & unknowns
Whether enough good adjacent word pairs exist; whether hidden split-size creates tension or just confusion; 5 players is thin for two tribes; clue collisions.

## Done means
5 phones each get a private word from a 3/2 split, each locks one clue shown on the host, all phones submit tribe-guesses simultaneously, the server scores same-word matches, and the host reveals both words and per-player scores correctly.
