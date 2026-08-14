## Overview
Two by Two is a phone-plus-laptop tool for homeowners, renters, and small offices who suspect (or have found) birds hitting their windows. It turns a single day of outward-facing timelapse into a per-pane, per-hour lethality map and emits a printable, correctly-spaced decal layout — the "2×2 rule" (no untreated gap larger than 2 inches wide by 2 inches tall) applied only where it's actually needed.

## Problem
Up to a billion birds a year die on US glass. Everyone's advice is the same shrug: "put up some stickers." Nobody knows *which* window, *where* on it, or *how much*. Bird-safe film is expensive and ugly, so people either do nothing or blanket the wrong pane. The physics — how much sky and vegetation the glass mirrors back, and whether a bird can see straight through to a plant on the far side — changes hour by hour with sun angle, and no consumer tool measures it.

## How it works
1. You mount an old phone on a tripod or gaffer-tape it to a fence, facing the window from roughly bird flight height (2–6 m out), and let it shoot one frame every 60 s from dawn to dusk.
2. You take one "ground truth" photo of the same window from *inside*, and mark the panes by tapping corners.
3. The desktop app registers every frame to a rectified pane quad (homography from the four corners), then per 2×2-inch cell computes two hazards: **mirror score** (how much of the cell is a specular reflection of sky/canopy) and **tunnel score** (how much of the cell shows interior-then-vegetation, e.g. a houseplant or a facing window).
4. Output: a heatmap per pane per hour, a day-summed risk raster, and a PDF at 1:1 scale showing exactly which cells need a dot — usually 20–40% of the glass, not all of it.
5. It then pulls BirdCast's nightly migration forecast for your county and tells you the specific dates the treatment matters most, plus a "treat before" deadline.

## Technical approach
Python + OpenCV + a small Qt or web UI. Pane rectification via `cv2.findHomography` on tapped corners. Mirror score: segment each rectified frame with a small semantic model (Segformer-B0 fine-tuned on ADE20K classes sky/tree/building) and compute the fraction of each cell labeled sky or vegetation *while the interior photo says that cell is glass* — reflections are, by construction, outdoor content appearing where indoor content should be. Cross-check with polarization if the user shoots a second pass through a cheap linear polarizer: specular reflection off glass near Brewster's angle (~56°) drops hard, so the per-cell difference between polarized and unpolarized frames is a direct, physically-grounded reflectance estimate. Tunnel score: cells where the interior photo shows vegetation/another window AND the outside frame shows low reflectance. Sun geometry from `pvlib.solarposition` given lat/long/time, used to predict when reflectance peaks even at hours you didn't capture. Data: BirdCast migration forecast tiles (Cornell), local eBird species list for a strike-species note. The hard part is separating reflection from transmission robustly with one uncalibrated camera and no HDR bracketing — clipped highlights and auto-exposure drift will fight you; lock exposure via the capture app and normalize with a taped-up gray card.

## v1 scope
- One window, one day, manual corner tapping
- Mirror score only (skip polarizer and tunnel score)
- Heatmap PNG + a 1:1 printable PDF decal grid
- Hardcoded 2×2 inch cells

## Out of scope
- Detecting actual strikes (audio/impact)
- Whole-house survey, drone capture, UV-reflective film modeling
- Any cloud service or upload

## Risks & unknowns
Auto-exposure and rolling glare may swamp the segmentation. The 2×2 rule is a guideline, not physics — a wrong-looking output could give false confidence. Users may not own a tripod-usable spare phone. BirdCast tile access terms need checking.

## Done means
Given a day of frames from a real window, it outputs a PDF whose printed dot positions, taped onto the glass, visibly cover every cell the heatmap scored above threshold — and a second capture day afterward shows those cells' mirror score drop by more than half.
