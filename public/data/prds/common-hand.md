## Overview
Three players finger-draw 27 glyphs between them and leave with a real installable font made by the room. There is no score. The only question is whether a recognizable single *hand* — one consistent set of stroke habits — can propagate around a ring of people who can barely see each other's work.

## Problem
Collaborative drawing games (exquisite corpse, blind portraits) end in a screenshot that gets lost. And they're funny precisely because the parts *don't* match. This inverts it: the group is trying to converge on one style under bad information, and the payoff is an artifact you can actually type in for years.

## How it works
The server deals each phone 9 of the 26 uppercase letters. 3×9 = 27, so exactly one letter is dealt twice — a contested glyph neither player knows about.

A hidden directed ring is assigned: A watches B, B watches C, C watches A. Before each glyph you draw, your phone flashes **one already-locked glyph from your watch-target for 4 seconds**, then blanks it. You cannot pause it, screenshot it usefully, or ask for another. You never see your own locked glyphs again, and you never learn who you're watching.

**Privately, on each phone:** the letter to draw at huge size, the 4s reference flash, a finger canvas with baseline / x-height / cap-height rails, a 20s timer, and undo-last-stroke only.

**On the TV during play:** nothing but a 26-slot progress grid where filled slots are solid black squares. The glyphs stay hidden, so nobody can shout style corrections across the room. The only leak is pacing — and pacing matters: if your watch-target is behind, you get a **DRAW BLIND** card instead of a reference, which is the game's real pressure.

**REVEAL:** the TV animates all 26 slots open at once. The contested letter shows both versions side by side, unattributed; the third player — the one who drew neither — casts the deciding vote, and the loser's glyph is visibly torn off the sheet. Then anyone types a phrase on their phone and the TV renders it live in the new face, with a QR to download the `.otf` and a specimen poster PNG.

## Technical approach
Socket.IO over Tailscale Serve; host tab is the only authority on the ring schedule. Strokes are captured as pointer-event polylines, resampled and normalized into a 1000-unit em box using the on-screen rails, then shipped as JSON (`{letter, strokes: [[x,y]...]}`). Room state: `assignments`, `ring`, `locked: Map<letter, glyph>`, `contestedLetter`. The reference-flash scheduler must pick a glyph your target has *already locked* and hasn't shown you before, degrading to DRAW BLIND rather than stalling.

The genuinely hard part is stroke-to-outline: offset each polyline by a fixed pen width into a closed polygon, boolean-union them with `polygon-clipping`, fix winding order, and emit contours via `opentype.js` → a downloadable `.otf`. Self-intersecting strokes and hairpin turns are where this breaks.

## v1 scope
- Exactly 3 players, uppercase A–Z, one round
- 9 letters each, one silent duplicate, one deciding vote
- 4s reference flash from a fixed hidden ring, DRAW BLIND fallback
- Specimen PNG guaranteed; `.otf` best-effort

## Out of scope
- Lowercase, digits, punctuation, kerning, accents, multiple rounds, spectators, re-drawing a letter

## Risks & unknowns
- Finger-drawn glyphs on a 6" screen may be too ugly to want; thick pen and rails are the mitigation
- 4s may be the wrong glimpse length
- `.otf` validity across macOS/Windows is a real compatibility tail

## Done means
Three phones, one round: every phone showed at least one 4s reference from exactly one other player and never its own glyph, the TV leaked no glyph before REVEAL, the duplicate letter was resolved by the uninvolved player, and the session ends with a downloaded `.otf` that installs on macOS and renders a typed phrase in the room's handwriting.
