## Overview
A blind collaborative music game for 3–5 non-musicians. Each player privately builds one instrument track of a short loop, deaf to everyone else's part, and the payoff is the first playback of the assembled whole — bounced to a shareable audio clip everyone leaves with. For friends who want to "start a band" for four minutes and walk away with proof.

## Problem
Group music apps let everyone hear everything, so one confident person drives and it stops being a band. The actual joy of playing together is committing your part and being *surprised* by how it fits. Party games also end in a scoreboard nobody remembers; here you end with an artifact — a 15-second track you can text to the group chat.

## How it works
Host sets a fixed tempo (90 BPM), a key that can't sound wrong (C minor pentatonic), and a 4-bar loop. Each phone is privately dealt one role — drums, bass, or melody — and shows ONLY its own tiny step sequencer (16 steps × a few snapped pitches). Critically, while composing you hear ONLY your own track looping (earbuds recommended); you never hear anyone else's until the reveal. The host screen shows only a countdown and who's locked in — never the music. When all lock, the server assembles every track and the host plays the full mix once, live, building layer by layer. That first playback is the whole game. The server then bounces the mix to a file and every phone gets a share/download QR — the keepsake. No points, no ranking.

Private (phone): your sequencer + your solo'd audio. Shared (host): tempo, lock status, then the assembled playback and a QR to the file.

## Technical approach
Host browser tab + phone PWA + authoritative WS server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{tempo, key, bars, roles:{playerId->role}, tracks:{playerId->stepArray}, phase}`. Each phone edits its `stepArray` locally and synthesizes audio on-device via Tone.js/WebAudio — because composing audio never leaves the phone, privacy is free and there's zero network-audio latency. On lock, the phone sends only its `stepArray`. Reveal: server broadcasts all `stepArray`s plus a shared start timestamp; the HOST alone renders the full mix scheduled to that timestamp, so there is no multi-device audio-sync problem at all. Genuinely hard part: making random inputs from non-musicians sound *good* — solved by pentatonic snapping, step quantization, sane per-role default velocities, and pre-balanced mix levels. Bounce = `Tone.Offline` render → Blob → object URL → QR.

## v1 scope
- 3 players, 3 fixed roles (drums, bass, melody)
- One 4-bar loop, one preset key/tempo (no host choices)
- One reveal playback, one shared download link
- Web-only, no accounts

## Out of scope
Role picking, multiple song sections, effects, per-phone synchronized audio, a saved gallery, anything beyond the pentatonic safety net.

## Risks & unknowns
Non-musicians may freeze at an empty grid — mitigate with a faint pre-seeded default pattern they can mangle. Continuous solo loops are annoying in a shared room — use "tap to preview" or push earbuds. If tracks clash the reveal deflates — scale + quantize hedge this. Core unknown: is blind composition delightful or just noise?

## Done means
Three phones each fill a private grid without hearing the others, hit lock, the host plays one assembled loop that is recognizably musical, and every phone can download the same audio file afterward.
