## Overview
A 3–5 player co-op party game where the phone is simultaneously the only source of your private information and the microphone that penalizes you for talking. The enforcement is not a rule, it's physics: a phone held 25 cm from your mouth hears you at ~+12 dB over a phone set down 1.5 m away. To speak loudly enough for the room to hear, you must first exile your phone — and your private clue ticker keeps scrolling while you can't read it. For groups who like Spaceteam-style panic but want the panic to be about *choosing when to give up information access*.

## Problem
"Quiet game" mechanics usually enforce silence with an honor system or a blunt loudness meter that just makes everyone whisper. Whispering is boring and un-social. The itch: make silence genuinely, physically expensive without a referee, and make the cost land on the talker alone.

## How it works
1. **Calibration (15 s).** Each phone asks its player to say "testing" at arm's length. It stores the RMS reference and sets `thresh = ref − 12 dB`.
2. **The ticker.** The host TV shows one shared puzzle: a 6-slot lock, each slot needing a symbol. No phone knows any answer up front. Instead each phone PRIVATELY shows a slow ticker — one clue line every 4 s, in deliberately small type (12 px, readable only within ~40 cm), e.g. "slot 3 is not the triangle", "whoever sees a red border owns slot 5". Each player's ticker is a different, partially overlapping clue stream. Lines expire and never repeat.
3. **The cost.** Your phone runs continuous RMS on your own mic. Every 100 ms above `thresh` burns one queued ticker line — permanently, unshown. So talking near your phone destroys your own future information. Talking with your phone across the room is free of burn, but you still can't read the ticker you left behind — same loss, different flavor.
4. **Host screen.** TV shows the 6 slots, current committed symbols, a countdown (4 min), and a per-player BURNED counter (public shame, no attribution of *what* was burned). It never shows clue text.
5. **Commit.** Any player can tap a slot on their own phone to commit a symbol; a slot locks on first commit. Wrong commits are revealed only at the end.

## Technical approach
- Host browser tab + phone PWAs; PartyKit / Cloudflare Durable Object holds the authoritative room. Socket.IO over Tailscale Serve works equally well for a LAN v1.
- Data model: `Room {code, phase, deadline, slots[6]{symbol|null, byPlayer}, players{id, ref_db, burned, queue[], cursor}}`. Clue queues are generated server-side from a solved puzzle so partial-overlap is guaranteed solvable.
- Audio stays on-device: `getUserMedia` with `echoCancellation:false, noiseSuppression:false, autoGainControl:false`, an `AnalyserNode`, 100 ms RMS frames. Phone sends only `{burn: n}` deltas at 2 Hz — no audio ever leaves the device. Server is authoritative for burn accounting and ticker advancement; the phone renders from server-pushed queue indices so a backgrounded tab can't cheat by pausing.
- Genuinely hard part: **AGC.** iOS Safari re-enables gain control unpredictably, which flattens the very distance gradient the game depends on. Mitigation: score on the ratio of the player's own band-limited RMS to a 3 s rolling broadband floor, and re-calibrate silently every 30 s. Second hard part: phones face-down on a table lose ~6 dB of high frequency, so calibration must be done in final placement.

## v1 scope
- 3 players, one 4-minute round, 4 slots not 6.
- Six symbol types, one pre-authored puzzle with three hand-written clue streams.
- Burn = drop the next queued line. No animations beyond the ticker itself.
- Host screen: slots, timer, three burn counters.
- QR-code join, no accounts, no reconnect handling.

## Out of scope
- Speech recognition, speaker ID, or any audio upload.
- Procedural puzzle generation.
- Scoring across rounds, lobbies, spectators.

## Risks & unknowns
- Cheating by whispering into a near phone: partially self-correcting (a whisper the room can't hear is useless) but a very quiet room may break it. Fallback: absolute SPL floor below which speech does not count *and* the host TV plays a constant 45 dB room tone.
- Small-type readability varies wildly by phone and eyesight; may need a per-device font calibration step, which is friction.
- Players may just hold the phone away from their face and shout — acceptable, that IS the intended trade, but verify it doesn't dominate.

## Done means
Three phones on a table, one round played end to end: each phone independently burns lines when and only when its own player speaks above calibrated threshold; the TV's burn counters match the sum of on-device burns within ±2; and at least one playtest group solves the 4-slot lock and one fails it by burning too much.
