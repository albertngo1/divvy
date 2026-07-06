## Overview
Offbeat is an audio social-deduction party game for 4–6 people wearing one earbud each, around a host screen. Every phone privately loops the same drum/click pattern — except the imposter's, which is shifted by an eighth note. On the host's count-in the whole room claps their pattern aloud; the imposter's claps land subtly wrong, and the group deliberates on who was "dragging."

## Problem
Deduction games lean almost entirely on words. But the ear is a brutally honest lie detector, and it's underused. The specific itch: an imposter who genuinely *perceives* a different reality — a private beat only they can hear — and must physically fight their own senses to blend into the crowd. That's a bodily bluff no text prompt can reproduce, and it only exists because each phone feeds a different private signal to a different ear.

## How it works
The host screen (TV) shows a shared count-in ("3… 2… 1…"), a bouncing metronome ball at the group tempo, and later the vote UI. It carries NO secret.

Each **phone PRIVATELY streams a looping pattern to that player's earbud**. Honest phones play the identical reference pattern locked to the host tempo. The **imposter's phone plays the same pattern shifted by an eighth note** (or with one beat added/dropped). The imposter is told they're the imposter but is NOT shown the honest pattern — they can only try to correct by listening to the room and forcing their claps to match, against the beat in their ear. The group claps together for ~4 bars, repeats once, then every phone privately votes who was off. Host reveals.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{code, tempoBpm, patternId, imposterId, phase}`. The **genuinely hard part is cross-device audio sync**: earbud loops must stay phase-aligned within ~15 ms or honest players drift and the imposter is masked. Approach: don't stream audio — ship every phone the pattern as data and schedule it locally via the WebAudio clock; synchronize clocks with an NTP-style ping/offset handshake to the server, then all phones `start()` at a shared future audio timestamp. Honest phones use offset 0; imposter's phone applies +eighth-note offset. Periodic re-sync corrects drift between bars.

## v1 scope
- 4 players, one earbud each, one fixed 4-bar pattern at one tempo
- Exactly one imposter, shifted a fixed eighth note
- One clap round (played twice), one private vote, host reveal

## Out of scope
- Multiple rounds/scoring, tempo or pattern selection
- Automatic clap detection via mic (humans judge by ear in v1)
- Melody/pitch variants

## Risks & unknowns
- WebAudio clock sync across cheap phones may exceed the 15 ms budget, blurring the tell
- Rhythm perception varies wildly; tone-deaf rooms may not hear the offset
- Requires everyone to have an earbud handy

## Done means
4 phones join, each loops a beat to its earbud phase-aligned within tolerance, exactly one is silently shifted, the room claps on the host count-in, all vote, and the host correctly reveals whether the offbeat player was caught.
