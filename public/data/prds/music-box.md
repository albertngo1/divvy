## Overview
Music Box is a 3–5 player cooperative jam toy. The host TV is the music box; each phone is a private instrument lane in a shared 16-step loop. Nobody sees anyone else's grid — you build the beat blind, reacting purely to what you hear coming out of the TV. The win condition is not a score: it's the loop itself, exported as an audio file + a printable 'score' poster the room made together.

## Problem
Group music apps are either solo (GarageBand passed around) or turn-based. There's no living-room toy where a whole room improvises one beat *at once* and is forced to listen to each other. The itch: emergent, blind collaboration where the fun is the surprise of the composite.

## How it works
The host loops a 16-step, 4-instrument bar at ~100 BPM, playing steady audio the whole time. Each phone is privately assigned ONE lane (kick, snare, bass-blip, chime) and shows only its own 16-step toggle grid + a moving playhead synced to the host. You tap steps on and off; you never see the other three lanes. Because you can only hear the combined result, you build by ear — 'someone's already on the downbeats, I'll fill the offbeats.' The load-bearing part: all four players edit SIMULTANEOUSLY and blind, so the loop evolves as a live conversation of ears. Pass one phone around and it collapses into a boring solo sequencer — the simultaneity and privacy ARE the game. After ~90 seconds a 'freeze' vote locks the loop; the host renders it to a WAV/MP3 and a poster showing all four lanes stitched together as a grid of dots — the keepsake, credited to the whole room, no leaderboard.

## Technical approach
Host browser tab holds the authoritative WebAudio clock and a lookahead scheduler (25ms tick, 100ms schedule-ahead) — phones make NO sound, sidestepping cross-device audio sync entirely. Data model: `{ loopId, bpm, lanes: { playerId: bool[16] }, playhead }`. Phones send only `{lane, step, on}` deltas over WebSocket (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Host applies deltas at the next bar boundary and echoes each phone its own lane state + a playhead heartbeat for visual sync. The genuinely hard part is the visual playhead on phones staying glued to the host's audio playhead across 30–80ms latency: solve with periodic server-timestamped heartbeats and client-side interpolation, tolerating ±1 step drift since only the host's audio is ground truth.

## v1 scope
- 3 players, exactly one 16-step bar, one round
- 4 fixed one-shot samples, kick/snare/bass/chime
- Fixed 100 BPM, no swing
- Export: one WAV + one PNG lane-grid poster

## Out of scope
- Multiple bars, song structure, tempo control
- Phone-side audio, custom samples, volume/pan
- Any scoring, ranking, or persistence beyond the export

## Risks & unknowns
- Blind layering may just sound like mud with novice players — needs a quantized, forgiving sample set so any combo is listenable.
- Playhead jitter could feel unsynced; may need to hide precise position and show only a pulsing bar-cycle.
- 'Freeze' consensus with silent editors: whose vote counts, and griefing a good loop.

## Done means
Three phones on the same WebSocket each edit their own hidden lane while the host plays the merged loop in real time; after a freeze the host produces a downloadable WAV that audibly contains all three lanes and a PNG poster showing the three grids — with no numeric score anywhere.
