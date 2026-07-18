## Overview
After the Tone is a 3-5 player concurrent-room game whose output is a single audio keepsake: one collaborative outgoing-voicemail greeting, spoken in relay by the whole room, that's incoherent because nobody could hear anyone else while recording. For friends who want a dumb, delightful artifact — and optionally a light who-said-which anonymity round.

## Problem
Group audio bits (a shared greeting, a countdown, a chant) always devolve into one loud person and a lot of 'wait, start over.' There's no way to capture everyone's simultaneous unheard contribution, and there's no artifact at the end — just a recording nobody kept.

## How it works
The host shows a skeleton greeting with numbered blanks assigned to players in slot order: [1] the setup, [2] the excuse, [3] the instruction, [4] the sign-off, plus a tone. Each phone PRIVATELY shows only its own slot's micro-prompt ('slot 3: tell the caller exactly what to do after the beep') and a record button. Players record simultaneously; crucially, no phone can play back or hear any other slot. You commit blind.

The HOST screen shows only anonymous 'recorded' checkmarks and a waveform-agnostic ready count — never the audio, never who. When all slots lock, the host concatenates the clips in slot order into one continuous greeting and plays it aloud for the first time. The mismatched tones, mid-sentence energy, and clashing instructions are the joke. The stitched file exports as a downloadable audio keepsake (WAV/MP3) the group can genuinely use as a voicemail greeting.

Optional anonymity round: the host replays each slot; every phone privately submits a guess attributing that voice to a player. You 'win' (socially, no points) by being the one voice nobody pins — the greeting itself is still the real prize.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Phones capture audio via MediaRecorder (Opus/WebM), upload each clip to the server (small: 3-8s each). Data model: Room{code, slots[], phase} and Clip{slotId, playerId, blobRef, duration}. Sync is upload-and-ack, not real-time streaming — easy. The genuinely hard part is server-side concatenation across heterogeneous phone codecs/sample-rates into one clean file: normalize loudness and resample (ffmpeg.wasm in the host tab, or a tiny ffmpeg step server-side) so the relay doesn't have jarring volume cliffs between slots.

## v1 scope
- 3-5 players, one greeting, fixed 4-slot skeleton.
- Blind simultaneous record + upload, host concatenation and first playback.
- Export one combined audio file. Anonymity guess round optional/stubbed.

## Out of scope
- Multiple greetings, re-records after lock, trimming UI.
- Background music beds, real-time monitoring, scoring/leaderboards.
- Actually installing it as your carrier voicemail (just export the file).

## Risks & unknowns
- iOS Safari MediaRecorder quirks and mic-permission friction on PWA.
- Loudness normalization across devices is the make-or-break for it sounding like one message vs. four random clips.
- Slot prompts must reliably produce funny clashes; needs a couple of tuned templates.

## Done means
Three phones each record a different blind slot without hearing the others, the host stitches them into one normalized greeting, plays it back, and downloads a single audio file — proving the blind-relay artifact works.
