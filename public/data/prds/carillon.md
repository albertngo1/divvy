## Overview
Carillon is a 3-5 player concurrent-room game that produces one short bell melody — a keepsake ringtone the group made together — while each player quietly tries to stay *anonymous* inside it. No points win; you win by your notes being un-attributable when the melody is finally heard.

## Problem
Group music tools either let everyone hear everything live (so people just imitate) or produce noise. The itch: co-write one tiny, genuinely pleasant phrase where your individual authorship dissolves into the whole — anonymity as craft, and a saveable artifact at the end.

## How it works
The host TV shows a blank 8-slot musical staff and, during writing, plays NOTHING — silence is the point. Each of the 8 note-slots is secretly assigned to a player (e.g., 5 players, so some own 1 slot, some own 2). Assignment is private.

Each phone PRIVATELY shows: which slot indices it owns (e.g., 'you hold slots 3 and 6'), a small piano/pitch dial to pick each owned note, and a subtle 'consonance hint' — whether your pick clashes hard with the running key the server infers, so you can aim to blend. Phones never hear or see other players' notes. The shared screen shows only how many slots are filled.

When all 8 are set, the host plays the finished melody aloud on bell/tubular samples for the first time — a real little phrase. Then a guess phase: each phone privately submits, for each other player, which slot(s) it thinks they placed. You 'win' (stay anonymous) if fewer than half the room correctly pins any of your notes. The melody exports as an audio keepsake regardless — nobody loses the artifact.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object per room). Data model: `{ slots: 8, ownerOf: slotId→playerId (server-private), pitchOf: slotId→midi, phase }`. Phones send only their owned pitches; the server withholds ALL audio state from every client until the `reveal` event — this leak-prevention is the crux, since one early note broadcast destroys anonymity. The consonance hint is computed server-side from already-committed notes and returned as a single scalar, never raw pitches. Reveal: host synthesizes with Tone.js/WebAudio bell voices; export via OfflineAudioContext → WAV/MP3. Guess phase is standard private submission + tally.

Genuinely hard part: strict no-leak sync (the server must be the only holder of the composite until reveal, resilient to reconnects that must NOT resend others' notes), plus making an arbitrary 8-note blind composition reliably sound *nice* — likely by quantizing all picks to one shared scale/key so blind notes still harmonize.

## v1 scope
- 3 players, 8 slots, one round
- Single fixed scale (e.g. C pentatonic) so any picks sound consonant
- One bell voice, WAV export
- Simple per-player anonymity tally, no leaderboard

## Out of scope
- Rhythm/duration control, chords, multiple voices, tempo, more than 5 players, cross-round campaigns.

## Risks & unknowns
- Does forcing a pentatonic scale make it too samey to guess authorship — or is that the fun?
- Is 'stay anonymous' motivating without a score?
- Reconnect handling must never resend hidden notes.

## Done means
Three phones each blind-place notes into privately-owned slots, the host plays and exports one consonant 8-note bell melody heard for the first time at reveal, and a guess phase reports who stayed anonymous — with no note audible on any device before reveal.
