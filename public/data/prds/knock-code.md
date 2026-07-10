## Overview
Knock Code is a 2–4 player cooperative silent-transmission game for a TV/laptop host plus one PWA per phone. It steals the POW "tap code": you communicate a word to your partner by knocking a 5×5 grid (row taps, pause, column taps) on the table — and the enforced constraint is that talking is forbidden, policed live by each phone's own mic.

## Problem
Most "communicate without words" party games let you whisper, mime, and giggle freely. Nobody ever actually has to hold silence. Knock Code makes silence the medium and voice the tripwire: the moment coordination gets hard, you *want* to whisper "was that two or three?" — and that itch is exactly what gets punished.

## How it works
Players split into pairs and sit apart. Each round one partner is Sender, one Receiver.
- **Sender's phone (private):** shows a secret 3-letter word and a live tap-log — it uses its OWN mic to detect table knocks, segments them into row/column counts, and relays the decoded pulses (as data, not audio) over the socket. Sender sees only "taps registered," never confirmation the partner understood.
- **Receiver's phone (private):** renders the incoming tap pattern as silent flashes + haptics, plus a keyboard to type the guessed word. The 5×5 grid legend lives here only.
- **Shared host TV:** a jail-cell scene, a round timer, and each pair's life-hearts — no letters, no taps.
- **The punishment:** every phone independently classifies its owner's audio. A knock is a short broadband transient; a voice is sustained + harmonic. If a phone hears its owner *vocalize* (whisper, groan, "psst"), that pair loses a heart and the current letter is jammed (blanked on the receiver). Three hearts, one word.

The fun is the mounting silent frustration: you can tap all you want, but the second your mouth opens, you've cost the team.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{pairs, round, phase}`, `Player{id, role, hearts}`, `Message{senderId, targetWord, pulses[], decodedSoFar}`. Each phone runs WebAudio: an AnalyserNode computes spectral flux for onset detection; a transient shorter than ~60ms with flat-ish spectrum → tap, sustained harmonic energy → voice-strike. Taps travel as structured events (`{type:'tap', t}`), so there's no cross-phone acoustic dependency — clean sync. The genuinely hard part is **tap/voice discrimination and tap segmentation**: telling a hard knuckle-tap from a plosive "P!", grouping taps into row-then-column with reliable inter-group gaps, robust to different table surfaces. A 5-tap calibration per phone sets per-device thresholds.

## v1 scope
- 2 players, one pair, one direction (Sender→Receiver).
- One 2-letter word, 5×5 grid.
- Voice-strike → lose a heart; 3 hearts.
- Win = Receiver types the correct word before time runs out.

## Out of scope
- More than one pair, bidirectional turns, scoring/leaderboard.
- Acoustic tap transmission between phones; noise cancellation of the partner.
- Full alphabet drills or a codebook tutorial.

## Risks & unknowns
- Tap vs. plosive-voice classification may false-positive; needs tuning + calibration.
- Table acoustics vary wildly; some surfaces barely register.
- Players may cheat with gestures — acceptable, silence is still the core.

## Done means
Two phones on one table: Sender knocks a 2-letter word, Receiver reads the flashes and types it correctly, and a deliberate whispered "which letter?" reliably deducts a heart on the whisperer's phone within ~500ms.
