## Overview
Duet is a 4–6 player silent match-finding game for a room full of earbuds. Each player secretly hears a looping rhythmic phrase piped only into their own earbuds; some players share an identical loop as hidden pairs. The whole point is to find your partner — without ever making a sound, because the one channel that would make it trivial (humming the tune) is the one the mic forbids.

## Problem
Party games never exploit the one genuinely private output every phone already has: earbuds. And 'find your secret partner' games always collapse into people just describing their thing out loud. Duet makes the private audio load-bearing and turns the urge to hum-along into the exact thing that gets you penalized.

## How it works
The server assigns each phone a loopId. In a 4-player game there are two matched pairs; add a 5th and one player gets a unique 'decoy' loop with no partner. Each phone PRIVATELY plays its loop on repeat into earbuds, shows a silent tap-pad, and shows a guess dropdown ('I match Player #__').

To broadcast your loop without voicing it, you TAP its rhythm on your phone (touch is silent; only your voice is banned). The HOST TV shows one anonymized animated pulse-bar per player (Player 1..N), driven live by their taps — the room studies the shared screen to spot whose pulse matches the rhythm in their own ears. Meanwhile each phone runs an on-device voicing detector: if its owner hums or talks to cheat-compare, only THAT phone flashes 'BUSTED' and freezes its taps for 4s. A shared room noise-floor sits on the TV as ambient pressure. After 90s everyone privately submits a guess; mutual correct matches score.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `player {id, loopId, taps:[t], guess, busted}`; server owns loop assignment so pairs and decoy are hidden. Sync: taps stream as onset events; host renders pulse-bars from them. Loop audio ships as a tiny preloaded sample, started on a server 'go' tick (per-phone drift is fine since each hears its own). Hard part: on-device voicing detection — autocorrelation pitch-periodicity + near-field RMS gating so a neighbor's hum bleeding into your mic never busts YOU; needs a 3s calibration.

## v1 scope
- Exactly 4 players, 2 fixed pairs, no decoy
- One 90s round
- 3 preloaded loops
- Tap pulse-bars + one voicing-bust rule + private guess

## Out of scope
- Decoy/odd player, multi-round scoring, streaks, spectators, custom loops

## Risks & unknowns
- Rhythm memory may be too hard to match reliably
- Voicing detector false-positives on giggles
- Requires everyone to have earbuds paired

## Done means
Four phones each play a distinct private loop, humming busts only the humming phone, taps drive the host pulse-bars, and correct mutual guesses are scored and revealed.
