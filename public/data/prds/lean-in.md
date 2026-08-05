## Overview

**Lean In** is a 4–6 player cooperative panic game for a living room with a TV and a table. The host screen is a failing machine; every player's phone is a lock on that machine. Passwords travel by voice only — but the phones are *listening*, and the phone that hears a password loudest is the one that opens. It is Spaceteam's shouting with an acoustic layer: volume and direction are now part of the puzzle.

## Problem

Voice party games treat speech as pure content — a channel for words. Real rooms have physics: sound falls off, neighbors overhear, whispering is a skill. No party game makes *how loudly and where* you speak mechanically load-bearing. Meanwhile "shout at each other" games flatten into six people yelling at the same volume forever, which is funny for ninety seconds and then just loud.

## How it works

Phones lie flat on the table, screen up, in front of their owners. One 90-second round.

**Your phone shows privately:** (a) your lock's status — `LOCKED`, its 2-word passphrase blanked out (`▮▮▮▮ ▮▮▮▮▮`), and a live "heard" meter; (b) a KEYRING of 2–3 passphrases that belong to *other people's* locks, each tagged with a hint about the owner ("the lock showing a red triangle").

**The host screen shows publicly:** each player's lock as a tile with its symbol and status, a shared reactor meter draining toward zero, and — the comedy engine — a WRONG OPEN feed naming every lock that opened by accident.

So: you read a passphrase off your keyring, find whose lock it is, and say it. The server samples every phone's mic level continuously; when a passphrase is matched, it opens **the phone that heard the loudest**, not the one you meant. Say it across the room at volume and you'll pop two locks at once — a wrong open costs reactor. The winning technique is physical: get close, aim your mouth at the right handset, and go quiet — which means five people simultaneously leaning over a table murmuring into strangers' phones.

Each open reveals a new keyring entry. Open all locks before the reactor empties.

## Technical approach

Host tab + phone PWAs + a PartyKit Durable Object as authority.

**No speech recognition.** Each phone runs `getUserMedia({audio:{autoGainControl:false, noiseSuppression:false, echoCancellation:false}})` into a Web Audio `AnalyserNode`, computes RMS in dBFS at 20 Hz, and ships a compact float over WebSocket. A 3-second calibration on join stores each device's room-tone floor; the server works in **dB above that phone's own floor**, normalizing mic sensitivity across an iPhone 12 and a cheap Android.

**Matching** is honor-lite: the speaker taps the keyring entry as they say it, which opens a 1.5-second arbitration window. The server takes the argmax of per-phone level over that window, requiring a **6 dB margin** over the runner-up; below margin it's `AMBIGUOUS` and burns reactor. Data model: `Room{players[], reactor, log[]}`, `Player{lockId, passphrase, keyring[], micFloor, level}`.

**The hard part** is that argmax margin. Too tight and normal conversation opens random locks; too loose and nothing ever resolves. It needs tuning on real hardware, not simulation. Secondary risk: mobile browsers throttle audio processing when the screen dims — the PWA must hold a wake lock.

## v1 scope

- One 90-second round, 4 players, 4 locks, one keyring hop
- Two-word passphrases from a fixed 40-word list
- Host screen: 4 tiles, reactor bar, wrong-open feed
- Calibration screen + tap-to-arbitrate
- Win/lose card, no scoring beyond time remaining

## Out of scope

Multiple rounds, difficulty ramp, decoy passphrases, a traitor role, speech recognition, cross-room play, spectators, any audio recording or storage.

## Risks & unknowns

Small tables may not give 6 dB of separation between adjacent phones — may require a minimum spacing rule printed on the join screen. iOS getUserMedia needs a user gesture and may cut the stream on backgrounding. Loud music in the room raises everyone's floor together; recalibration mid-round may be needed. Some players will feel weird whispering into someone else's phone — that's either the joy or the dealbreaker.

## Done means

Four phones on a table, four humans, no explanation beyond the host screen: the room opens all four locks inside 90 seconds on at least one of three attempts, the wrong-open feed fires at least twice per game, and at least one player is observed physically leaning across the table to whisper.
