## Overview
A phone app that estimates the Unified Glare Rating (UGR) of an indoor space from a single photo, aimed at lighting designers, facilities managers, and warehouse/office safety inspectors who need a rough glare number but can't justify a calibrated luminance meter or a full DIALux model. Sparked by the 'Differentiable Unified Glare Rating' paper—taking a serious lighting-compliance instrument and making it a pocket toy.

## Problem
UGR is the standard metric behind workplace lighting codes (EN 12464-1: offices ≤19, etc.), but measuring it properly means an imaging luminance photometer (thousands of dollars) or modeling the whole room in DIALux. A facilities person who just wants to know 'is this glary conference room roughly compliant?' has nothing between 'squint and guess' and 'hire a consultant.'

## How it works
You take a photo (ideally a bracketed exposure) toward the viewing direction. The app detects bright light sources (luminaires, windows), estimates each source's luminance from pixel values plus a rough exposure/calibration factor, estimates its solid angle and position index relative to the camera's line of sight, and computes the UGR formula: `UGR = 8·log10( (0.25/Lb) · Σ(L²·ω/p²) )`. Output: a single number, a heat overlay of the offending sources, and a pass/borderline/fail against the chosen standard.

## Technical approach
Stack: React Native + on-device ML. Use the camera's multi-exposure capture to build a crude HDR luminance map (calibration is the crux—map raw pixel → cd/m² via known exposure params and an assumed white-point, offering a one-time calibration against a phone-measured lux reading). Segment light sources with a small on-device model or simple thresholding + connected components. Compute solid angle from apparent size + an assumed source distance (user taps to set), position index from the Guth formula. All local, no cloud. Hard part: absolute luminance from an uncalibrated phone camera is genuinely uncertain—v1 targets *relative* ranking and order-of-magnitude UGR, honestly labeled ±3, not a certifiable measurement.

## v1 scope
- Single-photo capture + manual tap to mark each light source and its rough distance
- UGR estimate with the classic formula
- Pass/fail against one preset (EN 12464 office = 19)
- Bright-source heat overlay

## Out of scope
Automatic HDR bracketing science, certified-grade accuracy, DIALux import, multi-point room averaging, Android/iOS parity.

## Risks & unknowns
Camera-to-luminance calibration accuracy; auto-exposure fighting you; users treating an estimate as a legal measurement (needs a loud 'indicative only' label); source-distance guesswork dominating error.

## Done means
For a test room with a known reference UGR from a proper tool, Glint's estimate lands within ±3 UGR and correctly ranks a glary vs. well-designed room in the same building.
