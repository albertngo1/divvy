## Overview

A 90-second argument game for 4 people where every phone is a personal surveillance device recording exactly one person: its owner. The room has to talk to win. Everything anyone says becomes evidence. For groups who like the specific horror of hearing themselves quoted back.

## Problem

Silence games usually meter speech in the moment — a bar drains, a buzzer fires, you shut up. The punishment is abstract and instant, so it stops mattering. Nobody has built the version where the punishment is *deferred and archival*: the cost of talking isn't a penalty, it's a permanent record you can't fully see, curated against you.

## How it works

The host TV shows five items ("rank these by how badly they'd survive a hurricane"). The room must agree on a public ranking in 90 seconds — an ordinary, loud, social task. Each phone privately shows its owner one secret agenda item that must finish in the top two. So you *must* advocate out loud.

Meanwhile each phone silently records only its owner, auto-slicing at every 400ms pause into clips of up to 6s. Each clip gets a heat score: loudness × duration, normalized against that phone owner's *own* distribution for the round — so a naturally booming voice isn't punished for existing, only for being loud relative to itself.

Privately, your phone shows a rolling gallows-preview: your current hottest clip, its live transcript, and one REDACT button, usable once. Redact and that clip is destroyed forever — but the TV publicly increments "P3 redactions: 1" without saying what was cut, which is its own confession.

At time, the TV plays each player's hottest surviving clip in isolation with its transcript. The room votes for the worst one. That player forfeits their agenda points. Quiet players have thin, boring clips — and no leverage on the ranking. That's the whole trade.

## Technical approach

Host tab + phone PWAs against a PartyKit Durable Object. Room state: `{phase, deadlineTs, items[], ranking[], players[{id, agendaItem, redactsLeft, hottest}]}`. Audio never leaves the device during the round — phones send only `{clipId, startTs, durMs, peakZ, heat, transcript}` (WebAudio AnalyserNode RMS + on-device SpeechRecognition). Only at reveal does the winning clip upload as a ~15KB Opus blob for host playback.

The genuinely hard part is attribution. Your phone hears your neighbour. Every phone streams a 100ms RMS envelope; the server does a per-bucket argmax across devices after NTP-style offset correction (ping/pong, median of 20), and a clip only counts against you where your device won the bucket by ≥5dB. Skew above ~80ms turns argmax into noise, so clock sync is the load-bearing subsystem.

## v1 scope

- 4 players, one 90s round, one hardcoded ranking prompt
- One secret agenda item per phone
- One redaction each, count shown publicly
- Four clips played on the TV, one vote, scores, end

## Out of scope

Multiple rounds, clip scrubbing, sentiment/"damning" ML scoring, saving clips after the game, spectator mode, more than 5 players.

## Risks & unknowns

Recording people is a consent issue — needs a loud, explicit opt-in screen and guaranteed deletion at round end. Argmax attribution may fail for two people sitting shoulder to shoulder. Heat may reliably select the least funny clip; a human-tuned heuristic (question intonation, laughter onset) might be needed.

## Done means

Four phones, one round: at least 3 of 4 played clips are correctly the right person's voice on human spot-check, redaction provably destroys the intended clip and only that clip, and the room laughs at playback.
