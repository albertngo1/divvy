## Overview
Fretless is a browser ear-training game that teaches an instrument's fretboard purely by sound — never by note labels. It plays a phrase; you reproduce it on a silent, unlabeled on-screen neck using only pitch feedback. For beginners who want to actually play by ear instead of reading tab forever. Sparked by the arXiv paper on embodied string learning for blind and low-vision musicians, married to Sonic Pi's 'the instrument is code/sound' ethos.

## Problem
Beginners memorize note names and tab, not sound. Sighted learners lean so hard on visual labels that the fretboard never becomes intuitive, and ear-training apps stay divorced from the instrument's actual geography. The blind-musician research shows a better path exists — location learned by feel and pitch — but no consumer tool teaches sighted players that way on purpose.

## How it works
Each round plays a short lick, then you reproduce it on a silent fretboard that displays *no* labels — only relative position. Land a note and you hear it; miss and you get a 'warm/cold' pitch nudge (the delta interval played back) rather than a label. Rounds escalate: single intervals → short licks → transpose the same lick to a new string. Score blends accuracy and speed; streaks unlock new regions of the neck. Optional Web MIDI input lets a real MIDI guitar or keyboard drive it; otherwise click/keyboard.

## Technical approach
Web Audio API synthesis: Karplus-Strong plucked-string for guitar timbre, additive for keys. Web MIDI API for real-instrument input; optional getUserMedia + YIN/autocorrelation pitch detection for acoustic input. A spaced-repetition pedagogy engine schedules cards, each a (root, interval-set, string/region) tuple, via SM-2-style intervals over a skill graph. Accessible-first: full screen-reader support and an audio-only mode, directly honoring the source paper. The hard part is feedback design — making 'you're one fret sharp' legible through sound and haptics *without* revealing a note name — and building progressions that actually transfer to a real instrument.

## v1 scope
- Guitar only, single string, intervals within an octave
- Click input, audio-only 'warm/cold' feedback
- 20-card SM-2 SRS deck, localStorage progress

## Out of scope
- Full-neck, chords, acoustic pitch detection
- Web MIDI real-instrument input (nice-to-have)
- Account sync, multiplayer

## Risks & unknowns
Making 'off by one fret' feedback legible without labels is unproven. Transfer from a silent on-screen neck to a real guitar is an assumption. Ear training is a grind — retention and daily-return risk are real.

## Done means
A new user finishes a 10-round session in which no note name is ever shown, receives only pitch-based feedback, and correctly reproduces a 3-note lick by ear on the silent fretboard.
