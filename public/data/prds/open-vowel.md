## Overview
A 3–4 player co-op signalling game where the enforced constraint is phonetic, not volume-based. Each phone runs a crude consonant detector on its own player's voice: fricative/plosive energy (a burst above 4 kHz with high zero-crossing rate) is a violation. Vowels, hums, whistles and pitch swoops are free. The room is therefore loud, expressive, and completely unable to say a word — which is the joke and the mechanic. For groups who found charades too visual and want a purely vocal, non-linguistic channel.

## Problem
"Don't talk" games punish sound. That's a dead room. The itch is a rule that punishes *language* while actively rewarding vocal noise, so silence-of-meaning coexists with a room full of ridiculous groaning. Nobody has built the constraint at the phoneme layer.

## How it works
1. TV shows a 3-slot **message strip** the room must reproduce, drawn from six icons (circle, spiral, ladder, comb, wave, star). The strip is shown to nobody — it exists only as three slots.
2. Each phone privately holds three things, and they never line up:
   - **You OWN slot k** — only your voice can fill it, via a 2-second recorded gesture.
   - **You KNOW the target icon for someone else's slot** — shown as a big icon with that player's color.
   - **A codebook fragment**: pitch-contour → icon mappings for only 3 of the 6 icons (rise, fall, flat, double-bump, swoop-up-down, wobble). Fragments overlap partially across players; no one holds all six.
3. So the knower must get an icon into the owner's head using only vowel sound, through a codebook they only partly share. The owner then performs the contour into their own phone; the phone classifies pitch contour via autocorrelation F0 tracking and commits an icon to the slot.
4. **The punish.** Any detected consonant burst from your phone injects STATIC on the host screen for 2 s and voids whatever slot is mid-commit. Your phone shows a private red flash; the TV shows static without naming who caused it — so the room has to work out who keeps leaking.
5. Reveal: TV plays the committed strip against the target. 3/3 wins.

## Technical approach
- Host tab + phone PWAs, authoritative Durable Object / PartyKit room.
- Data model: `Room {target[3], slots[3]{icon|null, state}, staticUntil}`, `Player {ownsSlot, knowsIcon, knowsForPlayer, codebook[3]}`.
- All DSP on-device. `AnalyserNode` FFT at 2048: consonant score = (energy 4–8 kHz) / (energy 100–1000 Hz) combined with zero-crossing rate over 30 ms frames; fire when score > τ for 2 consecutive frames. Contour classification: YIN/autocorrelation F0 at 50 Hz, normalize to semitones over the 2 s window, match to four templates by DTW distance.
- Phones send only events: `{consonant, t}` and `{contour: 'rise', conf}`. No audio leaves the device. Server owns slot state and static windows so a lagging phone can't commit into a static window.
- Genuinely hard part: **the detector's false-positive rate.** Laughter, sibilant breath, a chair scraping and a plosive P into a close mic are all similar. Too hot and the game is unplayable; too cold and people just talk quietly. Needs per-player calibration (record 3 s of hum, 3 s of "ssss-t-t-k") to set τ from the actual gap between the two distributions, plus a 400 ms refractory period.

## v1 scope
- 3 players, one round, 3 slots, four icons, three contours (rise / fall / flat).
- Hand-authored codebook fragments guaranteeing at least one gap the room must talk around — without talking.
- Static = a 2 s TV overlay and a voided slot. No scoring beyond win/lose.
- Per-player 10-second calibration screen.

## Out of scope
- Speech recognition of any kind, real ASR, or transcript display.
- More than four icons, multi-round play, or a persistent codebook that grows.
- Handling players sharing one room mic.

## Risks & unknowns
- The consonant detector may be the whole game's fate; if calibration can't separate hum from fricative on cheap Android mics, the design collapses. Prototype this first, standalone, before anything else.
- Pitch-contour classification requires people to actually sing-ish; tone-deaf players may find it inaccessible. Consider widening to loudness contour as an alternate axis.
- Codebook-fragment negotiation may take longer than the round, making it feel unsolvable rather than tense.

## Done means
A standalone calibration harness shows ≥90% consonant-burst detection with ≤1 false positive per minute of humming, on two different phone models; then three phones play one round end to end where at least one slot is voided by a real accidental consonant and the room wins on a retry.
