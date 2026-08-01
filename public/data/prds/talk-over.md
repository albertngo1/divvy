## Overview
Talk Over is a 3–4 player cooperative same-room game (host tab + phone PWAs) that inverts the Spaceteam contract. In Spaceteam, humans shout instructions at each other. Here, the *phones* shout the instructions — loudly, out of their own speakers — and the humans spend the round negotiating airtime for their devices. Human speech becomes pure scheduling protocol.

## Problem
Every voice party game asks players to read text aloud, which turns into a reading-speed contest and rewards whoever is loudest. Talk Over removes reading entirely: the order arrives as *sound you cannot re-read*, so listening, memory and turn-taking discipline replace throat volume. It also creates a mechanic no single passed-around phone can produce — the game is literally about four speakers in four places in the room.

## How it works
Each phone is a console with three uniquely-labelled controls (a toggle, a 1–9 dial, a big coloured button). Each phone also privately holds a queue of three opaque ORDER cards. An order card has no text — only a PLAY button.

Tapping PLAY blasts a ~4s pre-rendered TTS clip at full volume from *your* phone's speaker: "Set the FLANGE DIAL to seven." The named control always lives on somebody else's console, and the clip never says whose. Whoever owns it taps it; the server validates and the host tally ticks up.

The constraint: if any two clips overlap in time, both are GARBLED — wasted, requeued at the back with a 10-second lockout, and the host screen flashes MUSH. Replays cost from a shared pool of six tokens. So the entire round is the room saying things like "mine next — no, wait, Dana go" while the devices do all the actual instructing.

Host screen shows: timer, an AIR indicator (green idle / red with the offending player's colour), completed/total orders, replay tokens left, MUSH flashes. It never shows any order text. Phones privately show only their own queue, their own control labels, and their own replay counts.

## Technical approach
Host browser + phone PWAs + one PartyKit Durable Object per room. State: `{phase, timer, orders: [{id, clipId, targetPlayer, targetControl, state}], replayTokens, airLog}`.

Playback is **optimistic**: the phone plays instantly on tap so it feels physical, and the server detects collisions after the fact — mush must actually be audible, that's the joke. Each PLAY sends a client-stamped `tapAt`; a 2s ping/pong loop maintains a rolling median clock offset so stamps land in server time within ~30ms. The server builds intervals `[tapAt, tapAt+duration]` and marks any pair intersecting by >300ms as garbled. That latency-fair collision arbitration across four phones tapping ~80ms apart is the hard part.

Clips are TTS rendered at build time into static mp3s (no runtime TTS). Phones preload and unlock the audio context behind the join tap to satisfy iOS autoplay rules, keep a silent looping buffer alive so the session doesn't suspend, and hold a wake lock. Clip loudness is normalised so no console is inaudible.

## v1 scope
- 3 players, one 3:00 round, 9 orders, ~12 baked clips
- 3 controls per console, hand-authored label set
- 4-letter room code, no accounts, no reconnect
- Win/lose only, no scoring, no waves
- Host page is static; everything else lives in the DO

## Out of scope
- More than 4 players, difficulty escalation, custom vocabulary
- Runtime TTS, i18n, spectators, rejoin-after-drop
- Captions or any non-audio order channel

## Risks & unknowns
- Phones held to the ear would defeat the shared-audio premise; v1 relies on a TV reminder to lay phones speaker-up on the table
- Clock skew could produce false MUSH calls that feel unfair
- iOS silent switch / low max volume may make a console unusable
- The round may read as annoying noise rather than fun chaos
- Fully inaccessible to deaf/HoH players

## Done means
Three phones and a laptop on one table. In a single 3:00 round the room completes all 9 orders with at least one MUSH flash occurring and being recovered from, nobody reads any text off a phone, and a recording of the round shows humans audibly scheduling device playback ("go", "wait", "you next") rather than relaying the order contents themselves.
