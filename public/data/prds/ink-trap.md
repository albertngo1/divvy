## Overview

A cooperative screen-printing game for exactly 4 players, ~8 minutes, that ends with a real 2400×3200 PNG the room actually wants to keep. Each phone is one ink plate of a single shared canvas. No scoring, no guessing, no voting anyone out — the win condition is a unanimous press sign-off on an image nobody has seen at full resolution.

## Problem

Group drawing games (Drawful, Broken Picturephone) treat the drawing as a disposable punchline; nothing survives past the laugh. Meanwhile shared-canvas whiteboards are boring precisely *because* everyone sees everything — there's no tension, just four people politely not overlapping. Nobody has made the constraint that makes real printmaking tense: you work a plate you can't see composited.

## How it works

Each phone is assigned an ink — cyan, magenta, yellow, or **black** — and shows a private canvas rendering **only its own strokes, in its own ink, on white**, plus shared registration marks and the crop box. Coordinates are identical across all four phones, so the plates are in perfect registration; you just can't see the other three.

Black is scarce: that plate gets a hard budget of 4000px of total stroke length, because black is the only ink that can define an edge. The other three have unlimited ink and are therefore responsible for mass, not line.

The **host screen** shows the *press check*: the live multiply-composite of all four plates, downsampled 16× and re-upscaled — enough to read composition, balance, and "we have a giant magenta blob bottom-left," not enough to read anyone's line work. It refreshes every 2 seconds. Talking is the coordination channel; the blur is the bandwidth limit.

Each phone also privately holds one **Brief** card — a secret element it must smuggle in ("a dog," "the number 7," "weather").

After 4 minutes, Press Check: every phone shows a **Sign** button. Any refusal adds 60 seconds and gives the refuser one out-loud note. When all four sign, the TV counts down and reveals the crisp composite for the first time; every phone gets a QR for the full-res PNG with a colophon — the four briefs, four sets of initials, the date.

## Technical approach

Host tab + phone PWAs + one PartyKit room as the authority. Data model: `Room{plates: {playerId → {ink, strokes: [{seq, pts[], width}]}}, phase, deadline}`. Phones send 100ms-coalesced point batches; the server relays each plate's deltas **only to the host**, never to sibling phones — that asymmetry is enforced server-side, not by client rendering.

Sync is unusually easy: plates are disjoint, so there are no conflicts and no merge semantics — an append-only per-plate log with a monotonic seq is sufficient. The genuinely hard part is **tuning the proof's information bandwidth**: too sharp and it collapses into an ordinary shared whiteboard; too blurry and coordination fails and the print is mud. Second hard part is compositing — four multiply-blended layers on a phone-authored canvas go muddy fast, so the host renders separations to offscreen canvases at 4× and only the host does the final export.

## v1 scope

- Exactly 4 players, fixed CMYK assignment, one 4-minute round
- One brush, one width, undo-last-stroke, no eraser
- Fixed blur radius on the press check, 2s refresh
- Unanimous sign-off with one 60s extension per refusal
- Export: host renders PNG + colophon, QR to download

## Out of scope

2–8 player scaling, spot colors, colored stock, eraser/fills, brush sizes, print fulfillment, saved gallery, replay/timelapse.

## Risks & unknowns

Phone finger-drawing may simply be too bad for the artifact to be keepable — the entire premise rests on that. Blur radius is a single magic number carrying the whole design. Rooms may verbally coordinate so thoroughly that the blindness stops mattering (the secret Briefs are the hedge). Multiply blending across four amateur plates risks a brown smear.

## Done means

Four phones on one hotspot draw for four minutes and all sign; the host exports a 2400×3200 PNG containing strokes from all four plates in correct registration with the colophon; all four phones download the identical file; and at no point during the round did any phone render another player's ink.
