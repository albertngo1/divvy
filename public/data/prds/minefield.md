## Overview
Minefield is a phone-native riff on *Trapwords* (itself a devious inversion of Taboo) for 3–6 players split across a shared host screen and private phones. One player describes a secret target word to their teammates — but the *opposing* team has secretly buried the obvious clue words as landmines. Say one and it blows up.

## Problem
Taboo hands the describer their own forbidden list, so the whole game is visible negotiation. The dread — the thing that makes *Trapwords* sing — is describing into fog, knowing a mine is somewhere near the word you were about to type but not *where*. That dread only exists if the trap list is genuinely hidden from the describer, which a passed phone or a shared screen destroys.

## How it works
Roles rotate; in one round Team A has a **Describer** + **Guessers**, Team B are **Planters**.
1. **Plant phase (private, simultaneous):** The target word (e.g. "volcano") is shown only on Planters' phones. Each Planter privately types trap words they bet the Describer will use ("lava", "erupt", "mountain"). Server dedupes into one hidden minefield. The Describer and Guessers never see this.
2. **Describe phase:** The Describer's phone privately shows the target. They type clue lines to the **shared TV** (so the room and server both read them). Guessers shout answers; the Describer taps a guess as "correct" to win.
3. **Detonation:** On each submitted clue line the server normalizes tokens (lowercase, stem plurals/verb forms) and checks against the hidden minefield. A hit triggers a full-screen explosion on the TV, burns one of three lives, and reveals *only that one* trap word. Survive to the target on remaining lives to score.

Privately per phone: Planters see the target + their own trap entries; the Describer sees the target only; Guessers see nothing but a guess box. The TV shows clue lines, lives, and explosions.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room{ phase, teams, targetWord, minefield:Set<stem>, lives, clueLog[], winner }`; each socket carries `playerId, team, role`. Sync: plant submissions are server-only writes never echoed to the opposing team's sockets; clue lines broadcast to TV + own team. The genuinely hard part is **fair fuzzy matching** — traps must catch "erupting" from "erupt" without nuking unrelated words, and the room must trust it. Use a small stemmer + explicit synonym-free exact-stem match, and always surface the triggered word so detonations feel earned, not arbitrary.

## v1 scope
- Exactly 3 players: 1 Describer, 1 Guesser (Team A), 1 Planter (Team B).
- One target word from a 30-word deck; Planter plants up to 3 traps; 3 lives; 90-second timer.
- Typed clues only; explosion animation; win/lose card.

## Out of scope
- Spoken-clue speech recognition; multi-round match scoring; role rotation; team sizes >2; synonym/semantic trap expansion.

## Risks & unknowns
- Stemmer false positives/negatives feel unfair — needs the reveal-the-word mitigation.
- Typed clues are slower than spoken Taboo; may sap pace.
- Planters could plant absurdly broad traps ("the"); cap traps and forbid function words.

## Done means
Three phones join one room; the Planter's 3 traps are invisible to the Describer; a clue containing a stemmed trap detonates on the TV and decrements lives; reaching the target within lives+time shows a win card; otherwise a loss card.
