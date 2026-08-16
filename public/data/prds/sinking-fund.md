## Overview

A 4-player public-goods game where the commons is the room's own silence and the mic is the only honest accountant — except it isn't, because private withdrawals are disguised as noise. For groups that enjoy accusing each other with confidence and no evidence.

## Problem

"Everyone be quiet" games are cooperative and therefore flat: the group either manages it or doesn't. There's no betrayal surface. The itch is a shared meter where a drop has two possible causes — someone made noise, or someone stole — and the room genuinely cannot tell which, so an innocent cough becomes a conviction.

## How it works

One 3-minute round. The TV shows a single large meter, the Fund, starting at 100 out of 200. It fills at +2/second whenever the room is silent, and drains proportionally to detected speech energy — one loud sentence costs roughly 8.

Each phone PRIVATELY holds: a pocket (starts at 0), a RAID button on a 25-second cooldown, and one Statement — a specific sentence ("admit you've never seen the second one") that pays 15 points if you say it aloud before time. Speech is required by design; the Fund punishes it.

RAID moves 8 from the Fund into your pocket, instantly and anonymously. The meter is drawn as a 3-second moving average with ±1 jitter, so a raid is visually indistinguishable from a two-second burst of talking. Nothing on the TV ever names a raider.

At time, if the Fund ≥ 120, every player gains 25. Below that, nobody does. Pockets are kept either way — so raiding is individually correct and collectively fatal.

Then the reckoning: the TV replays the Fund's timeline with speech events marked (who spoke, when, how loudly) but raids unmarked. Each phone privately accuses one player. A correct accusation takes half that player's pocket; a wrong one costs you 10.

PRIVATE per phone: pocket, cooldown, Statement, accusation. SHARED: the meter, the timeline, final scores.

## Technical approach

Host tab + phone PWAs + Socket.IO over Tailscale Serve (or a PartyKit room), server authoritative. Each phone's AudioWorklet emits a 10Hz calibrated voiced-energy scalar; audio never leaves the device. Server attributes each 250ms window to the argmax device with a 3dB margin and hysteresis, and logs `{t, speakerId, energy}`.

Data model: `Room{fund, history[{t,fundValue}], speechLog[]}`, `Player{id, pocket, lastRaidAt, statement, saidIt, accusation}`.

The hard part is not sync — it's making the camouflage honest. The server must apply raids with the same smoothing kernel and jitter distribution as speech drains, and must never emit a raid event to the host. Fund state is broadcast at 10Hz as a single scalar; nothing else about the drain reaches the TV.

## v1 scope

- 4 players, one 3-minute round, fixed constants (+2/s, raid = 8, threshold 120)
- One Statement per phone, self-marked with a "said it" tap
- TV: meter, clock, nothing else
- One private accusation each at the end, one resolution screen

## Out of scope

ASR verification of Statements, multiple rounds, variable raid sizes, roles, reconnects, any tuning UI.

## Risks & unknowns

If raids are too obvious the deduction is trivial; if too well hidden the accusation phase is a coin flip — the jitter magnitude is the whole game and will need live tuning. Self-marked Statements are trivially cheatable in v1 and may need the room's confirmation. A quiet room might just never raid, which is a boring equilibrium; the +25 threshold may need to sit right at the edge of achievable.

## Done means

Four phones in one room: a raid and a two-second cough produce visually indistinguishable dips on the host meter (confirmed by three of four players guessing at chance), a full round completes, and the accusation screen correctly transfers pockets.
