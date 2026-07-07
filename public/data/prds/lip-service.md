## Overview
Lip Service is a fast, competitive party game for 4–8 players split into pairs, played across a shared host screen and per-phone controllers. One player in each pair silently *mouths* a secret word; their partner lip-reads and types guesses. The catch: your own phone's mic is a mouthguard made of software — voice a single syllable, even a whisper, and it flags you and voids the point. It's the party-store 'mouthguard' game with no wet plastic, enforced by the one sensor everybody already carries.

## Problem
Silent-communication games are hilarious but need props (mouthpieces) or an honor system nobody honors. There's no enforced 'no talking' rule at a party — someone always cheats by whispering. The itch: make silence *mechanically binding* and funny, using hardware people already hold to their face.

## How it works
Players pair up. Each round, the **speaker's phone** privately shows a single word plus a category tag ('food', 'movie'); the **guesser's phone** is a private guess pad with a text box and a live 'attempts' list. The speaker holds the phone near their mouth and mouths the word — no voice allowed. The guesser watches lips, types guesses; a correct match locks the point.

The enforcement is per-phone: the speaker's mic runs continuous voicing detection (RMS + pitch/harmonicity). Pure mouth-air and clicks pass; any *voiced* sound above the near-field floor trips a red 'CAUGHT' flash on the speaker's phone and freezes their word for 3 seconds. The **host TV** shows only the scoreboard, a round timer, and a row of pair 'lights' (green = clean, red = someone just got caught) — never the secret words. All pairs play simultaneously with different words, so the room is a chaos of frantic silent faces.

## Technical approach
Host browser tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{pairs, round, deadline}`, `Player{id, pairId, role, secretWord, caughtUntil, score}`. Voicing detection runs **on-device** (WebAudio `AnalyserNode`, ~50ms frames): gate on RMS above a calibrated near-field threshold AND periodicity (autocorrelation) to separate voiced speech from breath/room clatter; emit only a boolean `voiced` event to the server, never raw audio. Server is authoritative for scoring and the caught-timer. Sync strategy: guesses and caught-flags are tiny events; the TV subscribes to aggregate light/score state only.

The genuinely hard part: distinguishing a cheating whisper from the *other three pairs* mouthing loudly two feet away. Solution is near-field calibration (hold phone to lips for a 3s baseline) plus requiring both loudness AND voicing periodicity from the owner's own close-mic, rejecting the diffuse far-field babble.

## v1 scope
- 4 players, 2 fixed pairs, one 45-second round
- 8-word deck, one category
- On-device voiced/unvoiced boolean + 3s freeze penalty
- TV shows score + two pair lights; phones show word (speaker) or guess pad (guesser)

## Out of scope
- Rotating roles, tournaments, custom word packs
- Accent/language tuning, difficulty tiers
- Any raw-audio upload or recording

## Risks & unknowns
- False positives from very breathy speakers or loud rooms; needs a forgiving whisper threshold
- Lip-reading may be too hard for obscure words — deck curation matters
- Cross-pair mic bleed defeating the near-field gate

## Done means
Four phones join, two pairs get distinct private words, a whispered syllable reliably flashes CAUGHT on only that speaker's phone within 200ms, a correctly typed guess scores on the TV, and the round ends on the timer — all with zero audio leaving any device.
