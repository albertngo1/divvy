## Overview
A secret-target silent laughing contest for 4–6 players. The host TV is a live 'still standing' board; each phone is two things at once—your private sabotage orders and an impartial mic referee policing your own silence. For groups who love 'try not to laugh' but hate arguing over who actually broke.

## Problem
'Try not to laugh' games have no referee ('you smiled!' 'no I didn't!') and no structure—they're passive staring contests. The itch: an incorruptible judge that objectively calls the crack, plus hidden targets that turn a flat staring contest into a directed duel of sabotage where everyone is both prey and predator.

## How it works
At round start each phone privately assigns you: (a) a TARGET—one other player, named obliquely by avatar or seat; (b) a BAIT card—a silent tactic to crack them ('mime eating a whole lemon,' 'unblinking eye contact,' 'slowly point at their shoes'); and (c) arms your mic. Everyone must stay totally silent. Your phone continuously listens to ITS OWN owner; any voiced sound—laugh, word, groan—means you CRACK: you're out, and credit goes to whoever had you as their target. You win by surviving longest AND cracking your own target. Only silent physical bait is allowed, because talking busts you instantly.

Private (phone): your target, your bait card, and a live 'heat' meter showing how close the mic thinks you are to breaking. Shared (TV): a ring of who's still in, and on each crack an animated arrow from saboteur → victim. It never shows anyone's target or bait until the reveal.

## Technical approach
Host tab + phone PWA + WS server. Data model: `Room{ players:{id, alive, targetId, baitId}, cracks:[{who, byTarget, t}] }`. Each phone runs WebAudio RMS + a voicing detector on its own stream; when voiced energy stays above a calibrated near-field threshold for >150 ms it emits `{cracked:true}`. The server marks the player out, credits the target's owner, and broadcasts standings—cheap, low-bandwidth, just crack events and the alive set, server-authoritative on ordering. The genuinely hard part is false positives: someone else laughing loudly next to you triggering YOUR phone. Mitigation: near-field calibration (hold phone ~30 cm, capture your baseline), require voicing + loudness above your personal threshold, short debounce, and an optional 'hold phone to chest' so proximity dominates. Anti-cheat: phone must keep the mic live (visibility/permission checks).

## v1 scope
- 4 players, one 90-second round
- One bait card + one target each
- Mic-crack detection, standings ring, reveal arrows
- Scoring = survive + cracked-your-target only

## Out of scope
- Teams, multi-round tournaments, bait card decks
- Camera/smile detection, rejoin after crack

## Risks & unknowns
Cross-talk false busts (biggest risk); people muffling their mic to cheat; laugh-vs-cough ambiguity; anticlimax if nobody cracks. Mitigation: calibration, timeout auto-reveal, and a 'sudden death' shared bait if it stalemates.

## Done means
Four phones each show a distinct private target + bait, staying silent keeps you in, an audible laugh flags THAT phone's owner out within ~300 ms and draws a saboteur→victim arrow on the TV, and one round crowns a surviving winner in a single live playtest.
