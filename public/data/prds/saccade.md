## Overview
Saccade is a single-player browser toy that teaches you to *look at art like an artist*. It shows you a painting, tracks your gaze via webcam, and compares your scanpath against recorded patterns of experts versus laypeople — turning "visual literacy" into a coached, replayable game. For museum nerds, art students, and anyone who suspects they glance at a masterpiece for four seconds and move on.

## Problem
The arXiv paper *"Divergent Gaze Patterns in Artistic Viewing"* documents that artists, neurotypical laypeople, and other groups distribute attention across a canvas very differently — experts sweep edges, negative space, and compositional lines; novices lock onto faces and the largest object, then leave. That difference is trainable, but there's no consumer tool that makes your own looking *visible* and coachable. You can't improve a habit you can't see.

## How it works
Pick a painting from a curated set. A 20-second "free look" records your gaze as a scanpath (ordered fixations + dwell times) rendered as a heat trail. Then the reveal: your trail animates side-by-side with a stylized "expert" scanpath and a "typical novice" one. The game scores overlap with each and calls out what you missed — "you never looked at the horizon line that anchors the whole composition." Challenge modes: "find the 5 fixation points a painter would hit," or "resist the face" (score penalized for over-dwelling on the obvious subject). A short progression walks through composition concepts (leading lines, rule of thirds, negative space), each with a painting that rewards the right scanpath.

## Technical approach
Fully client-side: WebGazer.js for webcam gaze estimation with a quick 5-point calibration, gaze samples clustered into fixations (dispersion-threshold I-DT algorithm) to form a scanpath. Comparison via scanpath-similarity metrics (ScanMatch / MultiMatch-style shape+position+duration scoring) against precomputed reference scanpaths — v1 uses a handful of hand-authored "expert" paths derived from the paper's described patterns (edge/composition-weighted) plus a saliency-model baseline for the "novice" path (an off-the-shelf saliency map as the naive attractor). Paintings are public-domain (Wikimedia/The Met Open Access). Hard part: consumer webcam gaze is noisy and calibration-sensitive — the scoring must be forgiving enough to feel fair while still distinguishing "swept the composition" from "stared at the face."

## v1 scope
- 5-point calibration + one painting
- Record scanpath, render heat trail
- Compare against one authored expert path + one saliency-novice path, show overlap score and one coaching callout

## Out of scope
- Any classification of viewers by neurotype (explicitly avoided)
- Real recorded expert eye-tracking datasets, mobile front-camera support, accounts/leaderboards

## Risks & unknowns
WebGazer accuracy varies wildly by lighting/webcam and may frustrate. "Expert" reference paths are authored approximations, not ground truth. Calibration friction could kill the first-run experience.

## Done means
After calibration, a user free-looks at the painting, sees their own scanpath animate back, and receives an overlap score plus one specific, correct callout about a compositional region they never fixated on.
