## Overview
A ten-minute cooperative composing game for 3 players whose only output is a printable punch strip for a real 15-note hand-crank music box. Nobody sees the score. Everybody hears the loop. You leave with a piece of paper you cut out, thread through a crank, and play.

## Problem
Collaborative music toys hand everyone the same canvas, so the group instantly becomes one loud person plus two spectators. And screen-native "creations" evaporate the moment the tab closes. The itch: a shared artifact where partial blindness is what makes the group necessary, and where the finished thing leaves the screen entirely.

## How it works
A 15-tine diatonic music box (C major, two octaves — everything sounds fine, which is the point at a party). The server splits the 15 tines into three disjoint, non-contiguous sets of 5 and deals one set per phone.

**Each phone shows privately:** only its own 5 lanes × 16 steps as a tappable grid, a live playhead, and its share of the room's hole budget. The other ten lanes are not greyed out — they are not rendered at all. Your phone makes no sound; it buzzes when one of your holes fires.

**The host TV shows publicly:** an 8-second loop playing continuously through the TV's speakers, and a paper strip scrolling right-to-left — holes become visible only as they cross the playhead, then scroll off. The whole score is never on screen. Persistent memory of the piece lives in three phones and three heads.

Two real constraints do the work. The room shares a budget of 30 holes total (your phone shows only your own remaining allowance). And a physical one: a tine needs time to reset, so two holes fewer than 2 steps apart on the same tine produce a dead click instead of a note — the TV clicks audibly and the offending hole renders hollow.

There is no score and no timer. The round ends when all three players hold PUNCH simultaneously for 2 seconds; the loop freezes, the TV finally reveals the whole strip, and the host exports a print-calibrated PDF plus a QR.

## Technical approach
PartyKit / one Durable Object. Model: `Room {code, tineAssignments, loopStartAtServerMs}`, `Hole {tine, step, byPlayerId}` in a set, `Budget {perPlayerRemaining}`. Toggles are tiny idempotent messages; the server is authoritative on budget and on the mute rule, and echoes an accepted/rejected verdict.

The hard part is the **clock**. The host is the sole audio device and runs a Web Audio lookahead scheduler (25ms tick, 100ms horizon) against `AudioContext.currentTime`; an edit landing inside the horizon must apply at the following loop, not this one, or notes double-fire. Phone playheads sync off a server-timestamped loop origin with a ping/pong offset estimate; ~30ms visual drift is acceptable, audio drift is not. Second hard part: the export must match a physical strip — hole pitch, margin, and lead-in live in a JSON profile calibrated against a real 15-note Kikkerland strip, printed at exact scale with a cut guide and a registration ruler so a bad printer scaling is visible before you cut.

## v1 scope
- Exactly 3 players, 5 tines each, 16 steps, one 8-second loop
- 30-hole shared budget, 10 per phone
- No undo beyond toggling your own hole off (refunds budget)
- Mute rule enforced server-side, click sound on the TV
- Export = single-page PDF at 100% scale, downloaded on the host machine
- One sample set (a single recorded music-box tine, pitch-shifted)

## Out of scope
Tempo control, 30-note strips, chromatic tines, undo history, saving/reloading a strip, more than 3 players, phone-side audio.

## Risks & unknowns
Whether "I can't find my own notes in the mix" reads as delightful or as helpless — it may need a one-shot "solo my lanes for 4 seconds" escape valve, which weakens the premise. 16 steps may be too cramped to feel like composing and too roomy to force cooperation. Print fidelity is the real gamble: if strips don't fit real music boxes on a home printer, the entire keepsake promise collapses, so the calibration ruler must be tested on three printers before anything else.

## Done means
Three phones join by code and each receives a disjoint 5-tine set; toggling a hole on one phone changes what the TV plays on the next loop within one loop period; two holes one step apart on the same tine produce a click, not a note; the shared budget cannot be exceeded from any phone; holding PUNCH on all three phones freezes the loop, reveals the full strip on the TV, and downloads a PDF that, printed at 100% and cut on the guides, plays the same 8 seconds on a physical 15-note music box.
