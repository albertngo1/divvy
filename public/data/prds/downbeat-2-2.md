## Overview
Downbeat is a 3-4 player cooperative round (host screen + one phone each) where the room cracks a 6-position combination lock by speaking the right digit on the right beat of a shared metronome. It's Spaceteam crossed with a drumline: coordination isn't 'say the thing,' it's 'say the thing *now*.'

## Problem
Most voice-coordination games test whether you recognize your cue. Few test *timing* — hitting a shared rhythmic window under escalating pressure. Downbeat makes tempo the antagonist: you know your digit, you just have to nail the instant, and adjacent players have to hand the beat off cleanly without clashing.

## How it works
The **host screen** shows six empty position boxes (1-6), a large pulsing beat indicator, and an audible metronome click. It plays a 6-beat bar, loops it, and ramps tempo each successful bar.

Each **phone privately** owns one or two positions, each labeled with its digit: e.g. phone A sees `POS 2 → 7` and `POS 5 → 3`. The six positions are split across the room so the group collectively holds the full combo but no phone — and no host box — ever shows it whole. On each beat the metronome advances 1→6; the player who owns the current position must **shout the digit aloud AND tap SPEAK on their phone within a server-arbitrated ~300ms window** centered on that beat. A correct on-time tap lights that position's box on the host; the spoken digit keeps the whole room's mental count synced and lets everyone catch a wrong-beat fire before it's too late. Any miss, early tap, wrong owner, or clash on the beat resets the bar to position 1. Clear all six in one clean bar to crack the lock. The squeeze: consecutive positions owned by *different* phones force verbal hand-offs, and consecutive positions on the *same* phone force panicked double-taps as tempo climbs.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve, holding the beat clock as the single source of truth. Data model: `Room{ combo[6], ownerByPos[6], bpm, barStart, currentPos }`, `Player{ id, positions[] }`. Server emits `beat{pos, serverTs}`; phones render locally against an estimated clock offset. The hard part is **fair timing under variable latency**: each SPEAK tap carries a client timestamp normalized against server-measured RTT, and the server judges hit/miss against the true beat window — too tight and good taps read as misses, too loose and it stops feeling rhythmic. Metronome audio plays on the host only, so all phones share one reference pulse.

## v1 scope
- Exactly 3 players, one hand-authored 6-digit combo, fixed position ownership.
- One fixed starting tempo, one ramp step on success.
- Tap-on-beat verification (shout is social/human layer, not machine-checked).
- Binary crack/reset; one lock.

## Out of scope
- Speech recognition of the spoken digit.
- 4+ players, randomized combos, multiple locks, scoring/leaderboard.
- Per-phone metronome audio or haptics.

## Risks & unknowns
- RTT jitter on phone Wi-Fi may make the 300ms window feel unfair; needs playtesting.
- Without machine-verified speech, players could tap silently and skip the voice layer — ownership hand-offs must be arranged so silence causes desync.
- Escalating tempo could get frustrating rather than fun; ramp step needs tuning.

## Done means
Three phones each hold distinct labeled positions, the host runs a shared looping metronome, and a room that taps every owned position within its beat window across one full bar sees a CRACKED screen; any early/late/wrong tap visibly resets the bar to position 1.
