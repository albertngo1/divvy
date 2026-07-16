## Overview
A collective forgery parlor for 3–5 players. Everyone traces the same ornate signature at the same time on their own phone; the host TV fuses all the traces into one official autograph. You win by *disappearing into the average* — if your stroke is the flagged outlier, the forgery is blown. The keepsake is the certificate the group forged together.

## Problem
Almost every party game rewards standing out. Vanishingly few reward blending in, and the specific delight of "we all signed as one hand and you can't tell who did what" only works if each person's stroke is captured privately and simultaneously — impossible to fake by passing one phone around.

## How it works
The host shows a looping signature template broken into ~5 numbered strokes. Round by round, all phones are told "trace stroke 3" and everyone drags it out on their own screen at once, blind to the others. Each phone privately captures its polyline (points + timing). The server aligns and averages every player's stroke into one merged glyph, computes each trace's deviation from the group mean (shape + speed), and flags the single biggest outlier.

Host screen (shared): the merged signature building stroke by stroke, and after each stroke a neutral verdict — "clean" or "one hand wobbled" — with the wobble drawn as a faint red ghost, but never named. Privately, only the flagged player's phone buzzes: "that was you — blend in next stroke." Nobody else learns who it was.

The group's goal across the 5 strokes: zero flags. Because you can't see the others, you're constantly guessing the group's pace and curve and conforming to an average you can't observe — the anti-showoff tension.

At the end, the merged signature is stamped onto a mock certificate ("Witnessed and forged by the undersigned") and exported as a PNG keepsake. Win = anonymity: a "clean forgery" if no stroke was ever flagged (or ≤1 across the round). No leaderboard, no per-player score — the whole point is that the finished autograph can't be attributed.

## Technical approach
Host tab + phone PWAs + authoritative WS server. Data model: `Room{ strokeIndex, template:[stroke], submissions:{playerId:[{x,y,t}]}, merged:[stroke], flaggedThisStroke:playerId? }`. Per stroke, phones POST their resampled polyline normalized to the template's bounding box. The server resamples each to N points, computes the mean polyline, per-player RMS deviation (Procrustes-aligned shape distance + timing variance), and picks the max as outlier if above threshold; it broadcasts the merged glyph + anonymized verdict to all, and a private "you were flagged" only to the outlier. Sync is turn-based per stroke (a barrier waits for all submissions), so there's no hard real-time — the genuinely hard part is the *fairness of the deviation metric*: it must flag real outliers without punishing a naturally shaky hand, and normalize for screen size and finger vs. stylus.

## v1 scope
- 3 players, one signature, 5 strokes, one round.
- Fixed template; RMS-deviation outlier flag.
- Certificate PNG export.

## Out of scope
- Multiple signatures, pressure/tilt capture, live (non-barrier) tracing.
- Difficulty levels, spectators, rematch.

## Risks & unknowns
- Deviation-metric fairness across hand sizes and devices.
- Is "be average" fun or frustrating without live feedback? The per-stroke buzz may be enough.
- Aligning wildly different traces before averaging (Procrustes robustness).

## Done means
Three phones each trace all 5 strokes blind; the host builds one merged signature, flags outliers privately per stroke, and — if the group stays clean — exports an unattributable forged-certificate PNG.
