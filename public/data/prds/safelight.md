## Overview
A 4-player, 6-minute co-op for people who like a puzzle with a physical cost. Each phone holds a private text brief. The brief is legible only while that phone's mic hears near-nothing; received sound *fogs* it, and fog never clears. The room must combine all four briefs to answer one question on the TV. Speech is the only channel — and speech is the thing destroying the documents.

## Problem
Most "be quiet" party games make noise a scoring penalty: abstract, deniable, easy to shrug off. Nobody feels it. We want the punishment to be *epistemic* — talking should take away the thing you were about to say, and take it from your listener too. Silence stops being a rule and becomes a resource you can watch draining.

## How it works
**Privately, per phone:** a paragraph of ~60 words (one quarter of a four-part logic puzzle: four suspects, four alibis, four objects, four times). Text renders at contrast = 1 − fog. Fog is a monotonic accumulator over received A-weighted energy: `fog += k · max(0, dB − floor) · dt`. At fog 1.0 the page is grey mush, forever. Distance is real physics — walk into the hallway and the room's talking barely fogs you, but you can't hear the sharing either.
**Publicly, on the TV:** four named fog bars, a 6:00 countdown, the question, and one answer slot the host taps at the end. Nothing else. No brief content ever reaches the TV.
The emergent arc is delicious: total stillness while everyone reads and memorizes, a long agonizing standoff over *who starts talking* (which cannot be negotiated), then a frantic burst of sharing that visibly cooks the room's remaining paper. Gestures, pointing at your screen, and mouthing are free and immediately become the meta.

## Technical approach
Host tab + phone PWAs + PartyKit Durable Object as the authority. Phones run WebAudio `AnalyserNode` at ~20 Hz, compute A-weighted RMS locally, and send `{playerId, dbfs, seq}` deltas at 10 Hz; the server owns fog state so a phone cannot rewind it. Room model: `{roundId, deadline, players: {id, fogAccum, covered, briefId}, answer}`. Host is a pure subscriber.
The hard part is calibration and cheating. Mic gain varies 20 dB across handsets, so on join the TV plays a 1 kHz tone at a known level and each phone reports measured RMS → per-device offset. Then the anti-thumb check: the TV emits a quiet 14 kHz chirp every 4 s; a phone that stops registering it has been muffled or pocketed, so the server marks it `covered` and fogs it at 3× until the chirp returns. Ambient HVAC/fridge noise sets `floor` from a 3-second pre-round baseline per phone.

## v1 scope
- 4 players, one hard-coded four-part puzzle, one round, one 6:00 timer
- Fog monotonic, linear, no clearing, no power-ups
- Win/lose only — no points, no leaderboard, no rematch flow
- Host answer entry by tapping four names into four slots

## Out of scope
Multiple puzzles, generated content, spectators, reconnection grace, per-word progressive reveal, teams, scoring curves.

## Risks & unknowns
The 14 kHz chirp may be inaudible on cheap speakers or annoying to some ears — needs a fallback occlusion heuristic (spectral flatness collapse). Fog rate tuning is the whole game: too fast and nobody can share, too slow and it's just Codenames. iOS Safari may suspend AudioContext when backgrounded, which reads as "covered" — acceptable, arguably correct.

## Done means
Four phones join, calibrate, and show legible briefs. A normal-volume sentence spoken mid-room measurably fogs all four bars on the TV, with the speaker's rising fastest and a player standing in the hallway rising slowest. A phone with a thumb over the mic gets flagged `covered` within 8 seconds. A room that stays silent for 4 minutes then shares can solve the puzzle; a room that chats freely from second one cannot read enough to try.
