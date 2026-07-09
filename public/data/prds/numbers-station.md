## Overview
Numbers Station is a phone-native riff on *Decrypto*, the code-clue word game. Two teams of two each hold four secret keywords that live PRIVATELY on their own members' phones. Each round a clue-giver broadcasts three coded clues; your team must decode your own cipher while the enemy tries to intercept it from a growing history of clues. It's for word-association lovers who like a spy-radio thrill.

## Problem
*Decrypto* is one of the best per-privacy tabletop games ever made — but it's fiddly: each team needs a physical screen/shield to hide its four words across a shared table, and leaks are constant. A single passed phone would expose both teams instantly. Per-phone privacy isn't a nice-to-have here; hiding your four words from the enemy while sharing them with your teammate IS the entire game.

## How it works
Setup: Team A's two phones PRIVATELY show the same four words in slots 1–4 (1=OCEAN, 2=CLOCK, 3=VELVET, 4=MOTH); Team B's phones show a different four. Each round the active clue-giver's phone PRIVATELY shows a 3-digit code (e.g. 4-2-1); they type one clue per referenced slot, in order. The three clues broadcast to the TV for everyone. The giver's teammate PRIVATELY taps to arrange the guessed code; the enemy team PRIVATELY submits an interception guess. The server reveals and scores: your team decoding wrong = a miscommunication strike; the enemy guessing right = an interception. Across rounds, the enemy's clue history (public on the TV) is the only ammunition for cracking which clue-words map to which hidden slots — yet nobody outside your team ever sees the actual words.

PRIVATE per phone: your four keywords, your current code, your team's guess, your interception guess. SHARED: all broadcast clues with round history, the scoreboard, whose turn it is.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit DO or Socket.IO over Tailscale Serve). Model: `Room{teams:{A:{players,words[4],miscount,intercepts},B:{...}}, round, activeGiver, code, clues[], history[]}`. Mostly turn-based, so the server simply gates phases (clue → private guesses → reveal) and pushes redacted state. Hard part: **strict information isolation** — enemy phones must never receive your words, even transiently in memory — plus exact clue-history bookkeeping so interception stays fair, and revealing both teams' concurrently-submitted private guesses together.

## v1 scope
- Exactly 4 players (2v2), fixed pre-seeded word lists
- 3 rounds total — enough for one interception to plausibly land
- Text clues only, room-code join, no reconnection

## Out of scope
- Solo/white-noise variants, 3–4 teams, custom word packs
- Timers, accounts, reconnection

## Risks & unknowns
- Decrypto's fun compounds over many rounds; 3 rounds may under-sell interception
- Typing clues is slower than speaking them
- Teammates with adjacent phones colluding via side channels

## Done means
Four phones split into two teams; each teammate sees the same four private words and the enemy never receives them (verified in the inspector); a giver's private 3-digit code yields three broadcast clues on the TV; both teams submit private guesses; and the server correctly scores at least one miscommunication and one interception across three rounds.
