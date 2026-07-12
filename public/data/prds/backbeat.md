## Overview
Backbeat is a concurrent-room hidden-role party game for 3–5 players: a shared host TV plays a groove, every phone is a private controller, and one player is secretly out of time. It's for groups who love Werewolf's paranoia but are tired of games that are just talking — this one is embodied, musical, and impossible to fake your way out of.

## Problem
Most 'one clue differs' hidden-role games collapse the moment everyone announces their view — the odd number outs the imposter in one sentence. The tell needs to be *continuous* and un-announceable, and it should literally embody the theme: the imposter should read a subtly-different private view and never realize it. Rhythm is perfect — you can't blurt a tempo, you have to sustain it, and being off feels *right* from the inside.

## How it works
The host TV plays a public drum loop at a fixed BPM that everyone hears (say 100 BPM). Each phone PRIVATELY drives its own metronome — a pulsing dot plus a haptic buzz — and the player must clap out loud on their pulse. Crew phones pulse locked to the public groove. The imposter's phone secretly pulses ~9% faster (109 BPM). Because you clap to YOUR OWN screen and buzz, the imposter honestly feels in time and steadily rushes ahead of the group over a 24-second jam. Everyone watches everyone's hands. Then each phone privately shows a vote: 'Who was rushing?' The TV reveals the tally. Crew win if the majority fingers the imposter; the imposter wins by escaping — or by sensing they're off and forcing themselves to drag against their own compelling buzz, which is the hard, funny part.
Private per phone: your BPM (only the imposter's differs), your buzz, your vote. Shared: the backing groove and the final reveal.

## Technical approach
Host tab + phone PWA + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{code, grooveBpm, phase}, Player{id, name, assignedBpm, role, vote}. At round start the server assigns roles and sets assignedBpm = grooveBpm for crew, grooveBpm×1.09 for the imposter. Sync: the metronome must not drift per device, so the server broadcasts a shared audioStartEpoch on a common timebase established by a one-time NTP-style clock-offset handshake (median round-trip). Each phone schedules its own pulses locally as startEpoch + n×(60000/assignedBpm) using WebAudio for sample-accurate timing, navigator.vibrate for haptics, rAF for the visual pulse. The genuinely hard part is sub-30ms cross-device clock alignment so the crew reads as tight and only the 9% offset stands out — plus tuning the offset to be detectable in 24s but not in 2s.

## v1 scope
- 3 players, one round
- Fixed 100 BPM groove, fixed +9% imposter
- Visual pulse + haptic buzz
- Hardcoded 24s jam
- Single 'who rushed?' private vote, text reveal

## Out of scope
Song selection, difficulty tiers, multiple imposters, cross-round scoreboards, earbud click tracks, calibration UI, spectators.

## Risks & unknowns
Clock jitter could make the crew itself look sloppy; haptic timing is coarse on some phones (fall back to visual-only); 9% may be mistuned and needs playtest; a loud room makes claps hard to hear — but the embodiment is the point.

## Done means
3 phones join by code; on start each shows a pulsing dot with one secretly 9% faster; players clap for 24s; each casts a private vote; the TV reveals the imposter and whether the crew caught them — the full loop runs one round with no manual restart.
