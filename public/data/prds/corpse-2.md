## Overview
Corpse (theater slang for breaking character) is a 3–5 player "don't make a sound" endurance game with a hidden manipulator. Each phone is both a temptation engine aimed at its own owner and a silent judge of that owner's voice. The last player to stay silent wins — unless the hidden Instigator has quietly farmed everyone else into cracking first.

## Problem
"Don't laugh" games fall apart because everyone sees the same prompt and cracks together, and one passed phone can't tempt four people privately. Corpse makes the temptation *asymmetric and simultaneous*, and adds a saboteur who wins by silence while everyone else is baited toward noise.

## How it works
The host TV shows only a calm shared scene (a looping stakeout, an ambient waiting-room) and a row of seat lights — green = still silent, grey = cracked. No prompts appear publicly.

Each phone PRIVATELY streams escalating bait to its owner on a timer: absurd captions, a fake "URGENT: say your teammate's name NOW," a slow-building silent joke, a photo. The bait sets differ per phone, so no two players are fighting the same urge at the same beat. Each phone's own mic runs on-device voice/laugh detection: the instant *your* phone hears *you* vocalize (laugh, word, gasp above threshold), it privately buzzes "you cracked" and flips your seat grey on the TV.

One player is secretly the **Instigator**. Their phone shows a different objective — "score 1 point each time someone else cracks" — and feeds them silent tactics (mime this, hold up your screen to Player 2). They must stay silent while goading others, so their per-phone bait is replaced by prompts to *cause* noise without producing any themselves. Round ends when one green seat remains: that survivor wins the honest game; the Instigator wins if ≥half the room cracked. A quick post-round vote (private, per-phone) guesses who the Instigator was for bonus.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Socket.IO over Tailscale Serve). Data model: `Room{ scene, seats:[{id, alive, role}] }`, per-seat private `baitQueue` and `role`. Each phone runs WebAudio RMS + a lightweight onset/laugh gate; on a confirmed vocalization it emits `crack{seatId}` to the server, which flips `alive=false` and updates the TV. Sync is easy (crack events are rare, low-frequency); the genuinely hard part is per-owner voice detection that fires on the owner's laugh but ignores other players' voices and the TV audio — solved by phone-held-close assumption, per-phone noise-floor calibration in the lobby, and requiring a short sustained onset above a personal threshold to count.

## v1 scope
- 3 players, one round, one ambient scene.
- One hand-authored bait set per seat; one hidden Instigator role.
- Per-phone mic crack detection + TV seat lights; single win screen.

## Out of scope
- Distinguishing laugh vs. cough vs. word (any vocalization counts in v1).
- Multiple rounds, bait difficulty tuning, richer Instigator toolkit.
- Post-round Instigator vote can ship after the core loop.

## Risks & unknowns
- False positives from neighbors' laughter bleeding into a phone mic (mitigate with hold-close + personal threshold).
- Bait that reliably cracks people is hard to author; needs playtesting.
- Instigator may be trivially obvious with only 3 players — validate fun at small counts.

## Done means
Three phones join, each privately receives a different escalating bait stream, and the moment a player audibly laughs or speaks their own phone flips their seat grey on the TV; the last silent seat is declared winner, and if the pre-assigned Instigator engineered ≥half the room to crack while staying silent, the Instigator-wins screen fires instead.
