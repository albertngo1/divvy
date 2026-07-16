## Overview
A foley / sound-scoring hidden-role game for 3–4 players. The group performs live sound effects over a short silent clip using their phones as soundboards; one player's private cue sheet is subtly wrong, and the whole room hears the result.

## Problem
Audio is an underused PRIVATE channel in party games, and hidden-role almost never involves live performance or timing. Foley makes the tell audible and shared: everyone hears the mistakes, but who fumbled is deliciously ambiguous — real players mis-time cues too, giving the imposter cover.

## How it works
The TV loops a 15-second silent animation with a visible timeline. Each phone is a soundboard of 2–3 big labeled buttons — its assigned sounds (Player A: footsteps + door; B: glass + thunder; C: splash + bell), so every phone is unique and needed. Each phone privately shows a scrolling CUE SHEET telling you when to hit which button ('0:04 door · 0:09 footsteps'). Honest players' sheets match the clip's true events. The imposter's sheet has 2 cues shifted or swapped.

On playback everyone performs live and the host plays the composite score aloud — mostly right, but the imposter's mis-timed hit clashes with the on-screen action (a slam over an empty hallway). Afterward the TV replays with a color-coded event log — who played what, when, versus the true events — and the group discusses, then privately votes the imposter.

PRIVATE per phone: your assigned buttons + your scrolling cue sheet (imposter's corrupted). SHARED: the clip, all audio (host is the speaker), the post-round timeline.

## Technical approach
Host tab plays the clip and mixes/plays every triggered sound; phone PWAs are thin soundboards; authoritative WS server. Data model: Room{ clipId, events[{t, sound}], phase, players[{id, role, buttons[], cueSheet[]}], hits[{playerId, sound, t}] }. The server assigns sounds, builds honest cue sheets from the true events, and builds the imposter's by perturbing 2 cues. Sync: latency matters — button press → server timestamp reconciled to clip time → host plays the sample. Keep the host authoritative on the clock; phones send presses with local t. The hard part is timing feel: a 200ms-off cue must read as 'wrong,' not 'network lag,' so preload all samples on the host and use a fixed offset. The scrolling cue sheet must stay synced to the clip clock across phones.

## v1 scope
- 3 players, 1 imposter
- one 15s clip with ~6 events
- 6 sounds split across phones
- scrolling cue sheet synced to clip
- host plays all audio
- timeline replay + one-tap accusation + winner banner

## Out of scope
User-uploaded clips, >4 players, phone-side audio, multiple rounds, latency compensation beyond a fixed offset, volume/mixing controls, mobile-Safari audio-unlock beyond a tap-to-start.

## Risks & unknowns
Network/audio latency could mask or fake the tell — the biggest risk. The clip needs events where a swap is audibly wrong yet ambiguous. Cue-sheet legibility while also watching the TV. Whether 3 players give the imposter enough cover. Reading a scrolling cue in a 15s window may overload players.

## Done means
3 phones + TV; one round plays the clip while phones fire host-played sounds on cue; the imposter's corrupted sheet produces an audibly mistimed sound a listener can notice; the timeline replay + accusation resolves to a winner; and testers can point to a specific wrong sound as the reason they suspected someone.
