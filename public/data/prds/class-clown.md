## Overview
Class Clown is a 4–6 player hidden-role game where the whole room takes a vow of silence — and one secret Clown wins by making others break it. The twist: the Clown is bound by the same silence, so they must provoke laughter and blurts *mutely*, using only faces, gestures, props, and what they're allowed to show on the shared screen. It's for groups who love the tension of trying not to laugh, with a whodunit layer on top.

## Problem
'Don't laugh' games get stale because the temptation comes from the game system, and one person's laugh cascades unfairly through the room. Class Clown makes the antagonist a *hidden human* who is also gagged, and each phone judges only its own owner — so your loss is genuinely yours.

## How it works
The host TV shows a class of desks (one per player) and a silent countdown. Each phone PRIVATELY shows your role. Most players see: 'Sit still. Stay silent. Survive.' plus a small fidget task (trace a slowly moving dot) to keep hands busy and eyes down. The ONE Clown privately sees a rotating deck of silent bait prompts — 'make eye contact and slowly mime eating a whole banana,' 'stare at the person to your left until they crack' — timed cues only they can see. The Clown scores per person who vocalizes; each victim who stays silent scores too.

Every phone's own mic continuously listens and busts ONLY its owner on a laugh/gasp/word — relative loudness on the close mic distinguishes your own voice from room crosstalk, so someone else laughing doesn't take you down. When you break, your desk flips on the TV (but not *why*). After ~2 minutes, a silent voting phase: everyone privately taps who they think the Clown was. The Clown earns bonus for every wrong guess.

## Technical approach
Host tab + phone PWAs + a PartyKit/Socket.IO WS server that assigns roles, streams the Clown's private bait prompts, and tallies scores/votes. Each phone runs local voice-activity detection: WebAudio `AnalyserNode` RMS + zero-crossing, calibrated per phone at lobby-in ('say your name') to set an owner-voice loudness threshold ~10–15 dB above ambient. On a detected vocalization the phone emits a timestamped BROKE event; the server flips that desk. The genuinely hard part is rejecting loud neighbor laughter on a shared close mic — solved with the relative-threshold calibration and a short refractory window; headphones/held-close phones improve it.

## v1 scope
- 4 players, exactly one Clown, one 2-minute round
- Fixed deck of ~12 silent bait prompts
- Own-mic bust with a single calibrated loudness threshold
- One silent vote at the end; simple score readout

## Out of scope
- Multiple Clowns, ML laughter classifiers, prompt authoring
- Cross-round campaigns, elimination replay, spectators

## Risks & unknowns
- False busts from coughs/HVAC; threshold tuning per device
- Clown prompts landing as funny without being verbal
- Cheaters muting their mic — needs a liveness ping

## Done means
Four phones play a full round where each phone busts only its own owner (verified: player A laughing does not flip player B's desk), the Clown's private prompts never leak to others, and the end vote plus Clown-evasion bonus resolve into a correct final score.
