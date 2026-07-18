## Overview
Goad is a 3-5 player silent-provocation duel for the shared-screen-plus-private-phone format. Everyone must stay dead silent while secretly trying to make one specific rival laugh, gasp, or blurt. The whole room becomes a web of mute theatrics where nobody knows who is working on whom.

## Problem
'Don't laugh' games (Straight Face, the try-not-to-laugh genre) are fun but symmetric — everyone is fighting the same shared bit. There's no private agenda, no asymmetric pressure, and one phone passed around can't run five simultaneous secret vendettas. Goad gives every player a private target and a private arsenal, so the silence is charged with hidden intent.

## How it works
Each round (90s) every phone PRIVATELY shows: (1) your assigned TARGET — one other player, named — whom you score by making produce any voiced sound; (2) a small hand of silent 'taunt' prompts you may act out (point-and-laugh, mime crying, flash them a fake horrified text, mock-slow-clap); (3) your own live 'you-are-silent' status light. You perform your taunts across the table using only face/hands/screen — no voice.

Every phone runs its OWN mic locally (WebAudio RMS + a light voicing/pitch check). The first phone that detects a voiced sound from its owner marks that player CRACKED. Whoever's target just cracked banks the point; the cracker is out for the round. The shared host TV shows only the roster of who is still silent and a dramatic 'CRACKED' stamp when someone falls — never who targets whom, never the taunts. Last silent player standing takes a survival bonus.

The fun: you must goad without laughing at your own bit, while three people you can't identify are working on you.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{players[], round, state}; Player{id, targetId, taunts[], silent:bool, score}. Targets assigned server-side as a derangement so no self-targets. Each phone runs on-device voicing detection (RMS threshold + zero-crossing/autocorrelation pitch gate to distinguish voice from taps/room noise) and emits a single CRACKED event with a timestamp; server resolves attribution and freezes state. Sync is event-driven, not continuous — low bandwidth. Genuinely hard part: mic thresholding that fires on a real gasp/word but tolerates ambient room hum and a nearby TV, per-device, without a calibration nightmare — solved with a 3s pre-round ambient-floor calibration per phone.

## v1 scope
- 3 players, one 90s round.
- One target each (derangement), 3 fixed taunt prompts.
- Per-phone mic bust via RMS + pitch gate, 3s ambient calibration.
- Host TV: silent-roster + CRACKED stamp + winner.

## Out of scope
- Multi-round scoring, taunt decks, difficulty tiers.
- Video/camera laugh detection.
- Reconnect handling, spectators.

## Risks & unknowns
- False bust from a cough or the TV bleeding into a phone mic.
- Players may whisper-coordinate to dodge detection — tune the voicing gate down.
- Is silent goading actually provocative enough, or too gentle?

## Done means
Three phones calibrate, each shows a distinct private target and taunts; a real voiced sound from any player fires that phone's CRACKED event within ~300ms, the server attributes the point to that player's goader, and the host TV updates the roster and declares the last-silent winner.
