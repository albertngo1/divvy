## Overview
Zoetrope is a 3-player concurrent-room drawing toy that turns a room into an animation studio. Each player owns one frame of a tiny looping animation and draws it simultaneously, guided only by dim trails of their neighbors' frames. The keepsake is the finished looping GIF — charming precisely because nobody could see the whole thing.

## Problem
Making an animated GIF together is normally impossible without one person 'directing' — someone owns the timeline and everyone else waits. And onion-skinning (seeing adjacent frames) is a solo feature. There's no group toy where the blindness between frames is the fun, and where every player is drawing a genuinely different, private thing at the same time.

## How it works
The group picks a motion prompt on the TV — 'a ball bounces,' 'a stick figure waves.' A 3-frame loop is split: Player 1 owns frame 1, Player 2 frame 2, Player 3 frame 3.

PRIVATE (each phone): a drawing canvas showing YOUR frame at full opacity, plus a faint live 'onion-skin' ghost of ONLY your two neighbor frames — for Player 2 that's frames 1 and 3, streamed low-res from the server as they draw. This ghost is different on every phone, because everyone has different neighbors. You draw your frame trying to make the motion flow across seams you can't fully see. All three draw at once during a single 30-second window.

SHARED (TV): during drawing the TV shows only a spinning empty film-strip and the countdown — never the frames. On reveal, it plays the three frames as a fast loop (like a zoetrope spinning up), then loops it forever while you laugh at the jitter.

No scores, no voting. The server stitches the frames into a looping GIF the group downloads. The wobble between frames — a ball that teleports, a wave that stutters — is the whole charm and the reason it's a keepsake.

## Technical approach
WebSocket server (PartyKit / Durable Object) holds `{prompt, frames:[{ownerId, strokes:[...]}], phase}`. Phones send stroke deltas (polylines) as they draw. The server pushes each phone a decimated, low-opacity render of only its two neighbor frames every ~500ms — the 'per-phone-different onion skin' is the load-bearing bit: each client gets a distinct ghost payload, so a single passed-around phone can't reproduce three simultaneous, differently-ghosted canvases. Frames are vector strokes (cheap to sync, resolution-independent). The genuinely hard part is the neighbor-ghost streaming staying live enough to actually help alignment without flooding — solved by throttled, downsampled per-owner render snapshots rather than raw stroke echo. GIF assembly happens host-side by rasterizing each frame's strokes to canvas and encoding (gif.js).

## v1 scope
- Exactly 3 players, exactly 3 frames (one each), one prompt
- Single 30-second simultaneous draw window
- Black pen only, one canvas size, no undo beyond stroke-delete
- One reveal loop + one GIF download

## Out of scope
- More frames/players, colors, layers, editable timing
- Re-draw/retry rounds
- Any scoring or anonymity guessing

## Risks & unknowns
- Is the neighbor-ghost actually helpful, or too faint/too laggy to align to? Core playtest question
- Ghost-streaming bandwidth on slow phones
- GIF encoding time on the host for a snappy reveal

## Done means
Three phones each draw one frame simultaneously with live neighbor-ghosts, the TV plays the 3-frame loop on reveal, and the group downloads a looping GIF of their animation.
