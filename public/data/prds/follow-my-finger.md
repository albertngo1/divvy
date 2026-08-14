## Overview
A solo, local-first health tool that measures your oculomotor system every morning: how smoothly your eyes track a moving dot (pursuit gain) and how fast they jump to a new target (saccade latency). Both are established, sensitive markers of fatigue, sleep debt, and impairment — the same signals the arXiv work on detecting at-risk drivers leans on. For anyone who wants an objective daily readout of "how sharp am I actually," not a subjective guess.

## Problem
Self-rated alertness is nearly useless — sleep-deprived people reliably feel fine. Meanwhile the body leaks the truth through the eyes: pursuit gets choppy, saccades slow, in ways you can't fake or feel. Clinicians read this by hand in seconds; there's no dead-simple consumer tool that tracks it longitudinally on your own webcam and ties it to your sleep.

## How it works
1. You open the app; it runs a 20-second protocol. A dot moves sinusoidally left-right (pursuit trial), then jumps to random targets (saccade trials).
2. The webcam tracks your gaze the whole time.
3. It computes pursuit gain (eye velocity ÷ target velocity), catch-up saccade count, and saccade latency (ms from target jump to eye onset).
4. It logs the three numbers with a timestamp and, if you connect Garmin/Apple Health, overlays last night's sleep duration and HRV. Over weeks you get a personal baseline and can see "today you're a bad night below your own normal."

## Technical approach
Browser-based, fully local: MediaPipe FaceMesh / FaceLandmarker (WebGL) for iris-center tracking in-browser — no video ever leaves the machine. Calibrate with a quick 5-point stare to map iris offset → screen coordinates. Pursuit gain from cross-correlating gaze velocity with the known target velocity; saccade onset via a velocity-threshold detector on the gaze trace. Store to IndexedDB; render trends with a small chart lib. Optional HealthKit/Garmin import via existing connectors. The genuinely hard part is signal quality from a commodity webcam: 30fps caps saccade-latency resolution to ~33ms, and head motion contaminates gaze — needs head-pose subtraction and rejecting trials where tracking confidence or lighting is poor, so noise doesn't masquerade as impairment.

## v1 scope
- One pursuit trial + one saccade block, 20s total.
- Three metrics logged locally with a running personal baseline.
- Simple line chart of each metric over time.
- Trial-quality gate that discards bad-lighting/bad-tracking runs.

## Out of scope
- Clinical claims/diagnosis, mobile app, cloud sync, multi-user, eye-disease screening.

## Risks & unknowns
- Webcam framerate may be too coarse for reliable saccade latency — pursuit gain may carry more signal.
- Between-day variance from lighting/glasses/caffeine could swamp the effect; needs strong normalization.
- Users may over-interpret noise as impairment — must present as a trend, not a verdict.

## Done means
Across a two-week self-trial, pursuit gain and saccade latency on mornings after <5h sleep are measurably and repeatably worse than after >7h for the same user, the quality gate rejects deliberately bad runs, and no frame of video is ever written to disk or sent over the network.
