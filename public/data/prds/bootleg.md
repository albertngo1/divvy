## Overview
Bootleg is a 3-5 player concurrent-room party game where every phone is a private recording booth and the shared host screen is the mixing desk. Together you build one looping a cappella track — the keepsake, downloadable at the end — and the win condition isn't points: you win by staying anonymous, by singing a stem nobody can pin on you.

## Problem
Collaborative music tools are serial and intimidating; karaoke exposes one person at a time; and group creativity rarely leaves you with something you can keep. Meanwhile voice is the single most personal identifier in a room. Bootleg leans directly into that itch — *can they tell it's you?* — while producing a genuine artifact.

## How it works
The host TV shows a 4-beat loop skeleton: a click track and a held chord. Each phone is PRIVATELY assigned a stem role (bass "dm", pad "ooh", melody "la la", mouth-percussion) and quietly encouraged to disguise the voice — falsetto, whisper, growl. On a synced countdown, all phones record 4 seconds through their mic simultaneously; only you hear your own take, and only the server receives your stem. The host then mixes and loops all stems into one track on the TV, labeled Stem A/B/C — never names. That anonymous loop plays as the reveal. Finally each phone privately submits an attribution ballot: for every stem, guess which player sang it. You win if your stem drew the fewest correct guesses. The host bounces the mix to a keepsake file / QR.

Private vs shared: each phone shows your role, record button, waveform, and your private ballot. The host shows the skeleton, then the anonymous mix, then only an anonymity result — never who sang what until the closing reveal.

## Technical approach
Host browser tab + phone PWA clients + an authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: Room{loopBpm, phase}, Player{id, role, stemBlob, disguised}, Ballot{voterId, guesses{stemId:playerId}}. Sync is a phase machine: lobby → assign → record(countdown-synced) → upload → mix → playback → attribute → reveal. Recording uses MediaRecorder (opus). The genuinely hard part is time-aligning stems to the loop: solve it with a client-side countdown plus trimming each clip to the click grid, and have the host schedule playback to bar-start via WebAudio — because it's a repeating loop, not tight percussion, small latency is forgiving. Mixing is WebAudio buffer sources on the host.

## v1 scope
- 3 players, one fixed-BPM loop, three fixed roles
- One 4-second simultaneous record
- One anonymous host playback
- One attribution round, screenshot the result (no file export)

## Out of scope
Pitch correction, multiple bars, effects, saved-file export, multiple rounds, spectators.

## Risks & unknowns
In a 3-person room a familiar voice may be trivially recognizable — mitigated by disguise + only 4 seconds. Mic latency/echo, iOS PWA mic permissions, and stem clipping are open questions.

## Done means
Three phones each record a 4-second stem simultaneously, the host plays one synced anonymous loop combining all three, each phone submits attribution guesses, and the host shows an anonymity result — with no phone ever displaying who sang which stem before the final reveal.
