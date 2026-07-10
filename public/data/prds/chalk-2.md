## Overview
Chalk turns the universal act of watching a clip together into a private prediction market. A group of 3–5 sits in front of the host screen; each holds a phone that is their sealed betting slip. It's for people who yell "she's TOTALLY going to open the door" at the TV — now the yelling costs you money.

## Problem
Watching something together is passive: opinions are cheap because they're free and public. The instant a prediction has stakes and secrecy, everyone leans in. But naive betting collapses when the table can see each other's picks — everyone just piles onto the obvious answer. Chalk fixes that with pari-mutuel payouts, where the crowd betting the favorite ("chalk") is exactly what makes the favorite pay nothing.

## How it works
The host plays a short clip and freezes at a scripted fork with 2–4 captioned options ("Does he: A) hug her, B) walk out, C) check his phone?"). A 15-second betting window opens. **Each phone privately shows:** the options, your chip balance, and a slider to stake chips across options — nobody sees anyone else's slip. **The host screen shows only:** the frozen frame, the options, and a countdown — crucially NOT the live bet distribution. When the window closes, the host resumes the clip to the reveal. Payout is pari-mutuel: all chips on losing options form a pot, split among correct bettors proportional to their stake. If four people bet chalk and it hits, they barely break even; one person who bet the weird option and nailed it scoops the pot. Three forks per clip; highest chip stack wins.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `Room{clipId, forkIndex, phase, players[]}`, `Player{id, chips, currentBet:{optionId:amount}}`, `Fork{options[], outcome}`. Sync: host drives phase transitions (WATCH → BET → REVEAL); phones POST bets, server validates against balance and echoes only aggregate-hidden acks. The genuinely hard part is trust and timing: bets must be sealed until the window closes (server withholds all distribution data, releases atomically), and the clip's freeze/resume must stay frame-synced to the fork so nobody bets after seeing the answer — solved by server-authoritative phase clock and pre-marked fork timestamps in the clip manifest.

## v1 scope
- One curated 60-second clip with 3 pre-marked forks
- 3–5 players, one round, one shared device pool of chips
- Pari-mutuel settlement, running chip total on host between forks
- 4 hardcoded clips to choose from

## Out of scope
- User-uploaded clips / auto fork detection
- Live odds display, cash-out, parlays
- More than one round or persistent profiles

## Risks & unknowns
- Sourcing clips with genuinely surprising forks (too obvious = no market)
- Frame-sync of freeze points across host playback jitter
- Whether 3 forks is enough drama or feels thin

## Done means
Five phones join a room, watch one clip, place hidden bets at three forks, and after the third reveal the host shows a final chip ranking where a contrarian correct bet demonstrably out-earned the crowd's chalk pick.
