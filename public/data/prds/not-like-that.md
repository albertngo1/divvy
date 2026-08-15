## Overview

Four players, one 90-second round, one obstinate automated phone system on the TV. The system accepts commands as a pair: the right word, said in the right *manner*. Nobody can supply both halves alone — the word lives in one mouth and the manner lives on someone else's phone.

## Problem

Every voice game in this lineage scores *what* you said. None score *how*. Yet describing a tone of voice out loud, at speed, without being allowed to demonstrate it, is a genuinely unexplored verbal puzzle — and it collapses instantly if one phone is passed around, because the whole game is that the person holding the requirement is not the person who can pronounce it.

## How it works

Each phone privately holds two things:

- **Your mouth:** three words that only you may say. Another player saying one of your words faults the panel.
- **Your card:** one live order — *someone else's* word, plus a required delivery (RISING, like a question / FALLING, like an order). You can read both. You may not say the word, and you cannot demonstrate the contour on it without saying it.

So you hold `SEAL — ask it`, Priya owns SEAL, and your only move is to talk her into it: *"Priya, your third one, the animal — but ask it, like you're not sure it's the right one."* Meanwhile the other three are doing the same to each other, and the panel is faulting on every flat, obedient, confidently-delivered SEAL. The room ends up inventing an entire vocabulary for intonation under time pressure — humming shapes, drawing with hands, "go up at the end," "no, sadder."

To say a word, you hold its button on your own phone and speak. The phone classifies your contour on-device and reports `{wordId, contour}`. The shared TV shows only the panel: six lamps, a fault counter, a 90-second clock, and after each utterance a stamp — ACCEPTED, or NOT LIKE THAT with a little arrow showing which way your pitch actually went. Cards refill the instant one clears, so there are always four in the air.

## Technical approach

Host tab + phone PWAs + an authoritative WebSocket server (PartyKit / Durable Object). Model: `Room { clock, lamps[6], faults, players[{id, words[3], card{targetWord, contour}}] }`. Cards are dealt server-side with the invariant that no card targets its own holder.

Push-to-say is the load-bearing engineering trick: it eliminates speech recognition entirely. The phone already knows *which* word is being claimed, so it only has to measure prosody. An AudioWorklet runs an autocorrelation (YIN-lite) pitch tracker at 30 ms hops over the held window, keeps voiced frames above a confidence threshold, and compares the median log-f0 of the last third against the first third: ≥1.5 semitones up is RISING, ≥1.5 down is FALLING, anything between is REJECTED as flat.

The hard part is that pitch range is per-person and per-voice. At join, each player does a ten-second calibration — say "okay?" then "okay." — which sets their personal semitone threshold and voicing floor. Everything else is trivially small: the server just matches `{speakerId, wordId, contour}` against open cards inside a 2-second window and lights or faults a lamp. Latency budget is generous; a 200 ms round trip is invisible here.

## v1 scope

- 4 players, one 90-second round, six lamps
- Two contours only: rising and falling
- Three words per mouth, one live card per player
- Ten-second pitch calibration at join; four-letter room code

## Out of scope

Whisper/shout dynamics, speed or emotion requirements, more than one round, scoring beyond lamps-lit, speech recognition of any kind, role rotation, spectator view.

## Risks & unknowns

Deep or creaky voices trip the voicing floor. Rooms full of laughter add pitch noise inside the held window (push-to-say helps: only your own mic, only while held). The biggest unknown is whether "describe a contour without saying the word" is delightful or merely frustrating — it may need the arrow feedback to teach the room fast enough in the first twenty seconds.

## Done means

Four phones join and calibrate; six lamps appear; holding your button and asking your own word as a question lights the lamp another player's card was pointing at, within 400 ms; saying it flat stamps NOT LIKE THAT with a flat arrow; saying a word that belongs to another mouth faults; six lamps lit before 90 seconds wins.
