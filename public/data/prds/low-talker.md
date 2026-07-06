## Overview
Low Talker is a Jackbox-shaped party game for 4–6 people in one room. Everyone is simultaneously a *sender* whispering a secret word to one specific target, and a *receiver* trying to catch the word aimed at them — all while the phone in your hand polices the volume of your own voice. The mic doesn't ban talking; it demands you talk *quietly and precisely*.

## Problem
"Silent" party games usually just mean 'don't speak.' That's a blunt constraint. The richer itch is a *Goldilocks* volume band: loud enough that one specific person hears you, soft enough that nobody else (and no mic) catches you. That tension — leaning in, breathing a word, watching the meter — is untapped and physical.

## How it works
The host screen shows the whisper graph: arrows saying 'Ana → Dev, Dev → Mo, Mo → Ana,' a shared countdown, and a live 'LEAK METER' that fills red whenever anyone breaches their volume ceiling. It never shows the words.

Each phone shows PRIVATELY: (a) your secret word, (b) who your target is, (c) a live volume bar with a green 'whisper band' and a red ceiling line, and (d) a text box to type the word you *received*. When you whisper, your own phone's mic reads your RMS envelope in real time. Cross the ceiling and your bar flashes, the host LEAK METER spikes, and you lose points — your device rats you out. Meanwhile your target is straining to hear and typing a guess.

A round scores on two axes: transmissions that land (receiver's typed word matches) and how quietly you kept it (peak volume under ceiling). Everyone whispers at once, so the room fills with a hush of competing murmurs — you must aim your voice like a directional beam.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{players[], graph{senderId→targetId}, ceilingDb, phase}`; `Player{id, secretWord, targetId, receivedGuess, peakDb, leakCount}`. Mic stays ON-DEVICE: WebAudio AnalyserNode computes RMS→dB ~20×/sec; the phone sends only a downsampled envelope + boolean 'over ceiling' events, never audio. Server tallies leaks and, at round end, matches guesses to words.

The genuinely hard part is calibration and crosstalk. Phones vary wildly in mic gain, and your neighbor's loud whisper can register on YOUR mic and falsely flag you. v1 mitigations: a 3-second per-phone 'whisper to calibrate' step that sets each ceiling relative to that phone's noise floor, and attributing leaks only on sharp self-onset envelopes (your own voice peaks fastest and loudest on your own mic).

## v1 scope
- 4 players, one round, ~60 seconds.
- Fixed whisper ring (each sends to clockwise neighbor).
- One word each from a small curated list.
- Per-phone calibrate step; live volume bar; type-back guess.
- Host shows graph, timer, LEAK METER, and end-round scores.

## Out of scope
Social deduction, multiple rounds, free-form targets, spectator mode, directional beamforming, anti-cheat against holding the phone to your mouth.

## Risks & unknowns
Crosstalk false-positives; mic gain variance; whether a noisy room drowns the mechanic; PWA mic-permission friction on iOS Safari.

## Done means
Four phones calibrate, four people whisper simultaneously, each phone flags only its own owner's over-volume within ~200ms, and at round end the host correctly shows who transmitted cleanly and who leaked.
