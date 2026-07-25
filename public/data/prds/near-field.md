## Overview
Near Field is a 4-player table game where volume is the addressing scheme. Every phone lies face-up and flat in front of its owner, acting as both a private screen and a fixed listening post. The room becomes a crude microphone array, and the server decides who *heard* what by comparing calibrated levels across devices. For groups who like tense, physical, giggling-in-silence games rather than shouting games.

## Problem
Every "be quiet" party game treats noise as a penalty counter — a meter that fills and buzzes. That's a tax, not a mechanic. Nobody has made volume itself *meaningful*: a continuous dial that determines the routing of information. Here silence isn't virtuous, it's precise; loudness isn't naughty, it's a routing error that leaks your secret to three opponents.

## How it works
1. **Calibration (10s):** the host TV plays a 1 kHz tone; each phone measures it and reports a per-device gain offset. Phones must stay flat and untouched after this.
2. Each phone shows **privately**: your PARCEL (a two-word tag, e.g. "AMBER KETTLE") and your ADDRESSEE (one other player). Nobody knows who is sending to them. All four assignments form a random derangement.
3. **90-second open floor.** To deliver, you lean over and whisper your parcel *at the addressee's phone*. The server buckets every voiced segment and classifies it by cross-device level gap:
   - max device ≥6 dB above all others → **UNICAST** to that device
   - gap <4 dB, or 3+ devices above the floor → **BROADCAST**
   - your own phone loudest → "you whispered to yourself" (wasted)
4. On UNICAST, only the receiving phone gets a private text box: type what you heard. Correct → sender and receiver both bank the parcel.
5. On BROADCAST, *every* phone that cleared the floor gets that text box, and a correct transcription steals the parcel's points from the sender. So asking "wait, who am I sending to?" out loud is instant self-destruction.
6. **Host TV shows** only: four phone icons with live coverage halos sized by how many devices currently hear sound, a rolling UNICAST/BROADCAST verdict log, and the score. Never the parcels, never the addressee graph, until the reveal.

## Technical approach
Phone PWA: `getUserMedia({autoGainControl:false, echoCancellation:false, noiseSuppression:false})` → AnalyserNode → 20 Hz frames of RMS dBFS + a spectral-flatness voiced flag, streamed over WebSocket with `performance.now()` stamps. PartyKit/Durable Object holds a 3-second ring buffer per player, aligns frames into 50 ms buckets using a per-client clock offset from periodic ping/pong, and runs segmentation (voiced onset → 250 ms silence = segment end).

Data model: `Room{phase, calib:{pid→gainDb}, floorDb}`, `Player{id, name, parcel, addresseeId, banked, points}`, `Segment{tStart, tEnd, levels:{pid→dbCal}, maxPid, gapDb, verdict}`.

The genuinely hard part is **cross-device level comparison under reverb and mismatched hardware**: room reflections compress the gap, iOS Safari partially ignores the AGC hints, and a 300 ms clock skew merges two speakers into one segment. Mitigations: tone calibration, a per-device rolling noise floor, requiring ≥250 ms of voiced audio, and a conservative AMBIGUOUS verdict that simply drops the segment.

## v1 scope
- Exactly 4 players, one 90-second round, one parcel each
- Tone calibration + flat-on-table rule
- Three verdicts: UNICAST / BROADCAST / AMBIGUOUS(drop)
- Typed transcription confirmation, exact-match after uppercasing
- One reveal screen: who sent to whom, who intercepted

## Out of scope
- Multi-round play, lobbies, avatars, reconnection
- ASR of any kind (humans transcribe)
- Beamforming, DOA estimation, >4 players
- Anything that works when phones are held

## Risks & unknowns
- iOS AGC may flatten the 6 dB gap; may need a louder "stage whisper" threshold
- Two people whispering simultaneously to different phones is the common case and must not merge
- Physically leaning across a table is charming with 4 people, awkward with 6

## Done means
With four phones on a real table: a whisper aimed at a chosen phone is classified UNICAST to that phone in ≥8 of 10 attempts, a normal-volume sentence is classified BROADCAST in ≥9 of 10, and the verdict plus transcription prompt reaches the correct phones within 500 ms of segment end.
