## Overview
Compost is an ambient, self-tending generative artifact for people who like a slow web garden more than a dopamine app. You seed it with a single image. Then it does almost nothing visible — once per day it feeds yesterday's frame back through an image model with a tiny fixed prompt, so the picture drifts, degrades, and eventually rots over 365 days into unrecognizable "humus." Like the LHC going quiet for Long Shutdown 3, most of the value is in a machine patiently working while you're not watching.

## Problem
Everything we make with image models is instant and disposable — prompt, screenshot, forget. There's no artifact that *takes time*, that you can't rush, that rewards leaving it alone. And a genuinely ambient piece should generate itself with near-zero daily attention.

## How it works
You upload a seed image. Each day a scheduled job runs one img2img pass at low strength ("denoise 0.25") with a fixed neutral prompt, plus a light deterministic decay filter (grain, desaturation drift, edge erosion). The new frame becomes tomorrow's input — a 365-step telephone game where entropy compounds. A minimal web page shows today's frame, a scrubber across all past frames, and a day counter. When the compost is "ripe" (day 365, or a stability threshold), you may plant a new seed: the next image inherits the rotted palette as a starting tint.

## Technical approach
Stack: a tiny cron-driven worker + static viewer. Model: Nano Banana Lite / any hosted image-edit API, or a local Stable Diffusion img2img if avoiding cost. Job: `today = model.img2img(yesterday, prompt, strength=0.25)` then apply a deterministic decay (Pillow/Sharp), write `frames/NNN.png` + append to a JSON manifest. Scheduling via a real cron (the homelab already runs crons) or a serverless scheduled function. Viewer: static HTML reading the manifest, `<input type=range>` scrubbing frames. Hard part: keeping drift *interesting* — too little strength and it's static for months; too much and it's mush by week two. Needs an easing curve on strength and maybe a mid-life "bloom" (one higher-strength day) to avoid a boring monotone slide to gray.

## v1 scope
- Upload one seed image
- A daily job that runs one img2img + decay pass and saves the frame
- A page showing today's frame + a scrubber over history
- A day counter

## Out of scope
- Multiple simultaneous compost bins, accounts
- Fancy decay physics, video export (nice day-366 feature)
- Real-time / on-demand acceleration (defeats the point)

## Risks & unknowns
A year is a long feedback loop to test — need a "fast-forward" dev mode that runs 365 passes offline to preview drift; hosted API cost/availability over 12 months; models may collapse toward a boring attractor (gray, or a generic face) — mitigation is the strength easing + periodic decay reset.

## Done means
Upload a seed, confirm the scheduled job produces day-1 and day-2 frames that are subtly different, and a dev fast-forward renders a coherent 365-frame drift film where the original is recognizable at day 30 and pleasingly unrecognizable by day 300.
