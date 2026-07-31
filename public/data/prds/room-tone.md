## Overview
Room Tone is a 3-minute, 4-player game where speech is legal but *expression* is fatal. Each phone privately assigns you a narrow pitch band derived from your own calibration take, and any voiced audio outside it burns a tiny shared allowance. Silence is always free and always safe. Meanwhile each player holds a private Bait objective whose whole purpose is to make somebody else laugh, snap, or shout. Named for the film-sound term: the recording of a room saying nothing.

## Problem
Silence games get boring because the fun state is "nobody does anything." Talking games get loud and the quiet people vanish. We want a game where talking is available, tempting, and structurally dangerous — where the punishment lands on *how* you spoke, not whether you spoke, so the quiet player is powerful rather than absent.

## How it works
Each phone records a 6-second calibration read. The server sets your Tone as a narrow band around your own median f0 (roughly ±6%), so nobody can borrow anyone else's voice, and the bands differ enough that imitation fails.

The host screen posts one Agenda that genuinely demands conversation — "decide, out loud, which one of you would survive longest without a phone, and justify it." Settling it out loud pays the room a pot.

**Privately on your phone:** your Tone band as a single needle with a live deviation meter for *your own voice only*; your remaining Slip (2.0 seconds of out-of-band voiced audio for the entire round, draining visibly); and one Bait card — "make the room laugh," "get someone to say your name," "get someone to interrupt you." **On the host screen:** the Agenda, the clock, the pot, and four unlabeled dots that flicker when *somebody* slips, without saying who.

Run Slip to zero and your phone hard-mutes you: a red card, no further speech permitted, and any voiced audio you produce from then on drains the shared pot — you become a liability everyone can hear but nobody can silence without spending their own Slip.

Scoring at the buzzer: Bait landed + unused Slip as a silence dividend + a share of the pot if the Agenda closed. The tension is exact: silence banks the dividend but lands no Bait, and Bait requires the most dangerous kind of speech there is.

## Technical approach
Authoritative room server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phone PWA runs an AudioWorklet doing YIN or normalized-autocorrelation f0 estimation on 40 ms hops with a voicing confidence threshold, plus RMS, and streams `{t, f0, conf, rmsDbfs}` at 25 Hz.

Data model: `Room{phase, agenda, pot, deadline}`, `Player{id, bandLo, bandHi, slipMsLeft, baitId, muted}`.

The hard part is that every phone hears every voice, so naive f0 tracking would penalize you for your neighbor's laugh. The server only evaluates a frame against your band when your device's level exceeds the second-loudest device's by ≥6 dB over its calibrated baseline — near-field ownership, same trick as any cross-talk-safe room, and everything ambiguous is free. Slip decrements server-side only, at 40 ms granularity, so no phone can lie about its own discipline. Host gets an anonymized slip-flicker feed; each phone gets only its own needle.

## v1 scope
- 4 players, one 3-minute round, one hardcoded Agenda.
- 6-second calibration per phone; band assigned from own median f0.
- Three Bait cards total in the deck, dealt without replacement.
- Slip = 2000 ms flat; hard-mute on exhaustion.
- Host screen: Agenda, clock, pot, four anonymous slip dots.
- Round-end: reveal bands, Bait cards, and a slip timeline.

## Out of scope
Multiple rounds, 5+ players, automatic Bait verification (players self-report and the room ratifies by a show of hands at the reveal), whisper handling, singing detection, language-specific prosody, any audio storage.

## Risks & unknowns
f0 estimation on phone mics with room reverb is noisy; octave errors are the classic failure and will feel unjust — mitigate with octave-jump smoothing and a deliberately forgiving band. Some players' natural range is wider than others', making bands unfairly tight (calibration must sample a full sentence, not a hum). Monotone speech may simply be too hard to sustain, blowing everyone's Slip in 40 seconds; Slip length is the first tuning knob. And the whole thing risks becoming a novelty voice-impression bit rather than a game.

## Done means
Four phones, one room, one 3-minute round: each player's Slip drains only on their own out-of-band voiced speech (spot-checked against the reveal timeline with under 10% misattribution), at least one player hard-mutes and the room visibly reorganizes around them, at least one Bait card lands, and final scores compute server-side without anyone consulting a rulebook mid-round.
