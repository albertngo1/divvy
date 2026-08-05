## Overview
Warm Front is a browser toy (and screensaver build) that performs background-oriented schlieren imaging with an ordinary webcam, rendering the refractive-index gradients of moving air as continuously evolving artwork. For anyone who has ever wanted to see convection without a $4k mirror rig — physics nerds, teachers, and people who want a wallpaper made of their own kitchen's thermals.

## Problem
Air is doing something dramatic in every room and you cannot see any of it. Classic schlieren requires a parabolic mirror, a point source, and a knife edge. Background-oriented schlieren needs none of that — just a textured background and sub-pixel motion estimation — yet it lives in fluid-dynamics papers instead of on anyone's laptop.

## How it works
Aim the webcam at a high-frequency textured surface: a printed noise sheet, a rug, a bookshelf, or a second monitor showing dense static. Hold still for a three-second calibration that locks exposure/white balance and captures a reference frame. Anything warm between camera and background bends light by a fraction of a pixel; the toy estimates that displacement field per frame and paints it.
Three render modes:
- **Knife edge** — directional derivative of the displacement, the classic ghostly grayscale plume.
- **Ink** — a million particles advected by the field, depositing color, so plumes leave trails.
- **Long exposure** — an accumulation buffer that builds for minutes into a still you can export as a 4K wallpaper.
Optional sonification: mean gradient magnitude over a region drives a filtered-noise bed in Web Audio, so the room audibly hisses when the kettle boils.

## Technical approach
Vanilla TS + WebGL2 (WebGPU path where available). `getUserMedia` with `advanced` track constraints to pin `exposureMode: manual` and `whiteBalanceMode: manual` — auto-exposure is what kills the signal. Pipeline per frame: linearize gamma → 4-level Gaussian pyramid → dense Lucas-Kanade in a fragment shader (15×15 window, 3 warping iterations per level) against a motion-gated exponential-moving-average reference → sub-pixel refinement by quadratic fit of the SSD minimum. All intermediates in RGBA16F; the real displacements are 0.05–0.5 px, so 8-bit anywhere in the chain destroys them. Particles live in a ping-pong position texture advected by the field, drawn as additive points, tone-mapped with ACES. A cheaper alternate path — Eulerian temporal band-pass at 0.2–3 Hz — gives shimmer without solving flow, useful as a fallback on weak GPUs.
The genuinely hard part is SNR: sensor noise is comparable to the signal, so it needs temporal averaging, rejection of frames with global motion (camera bump), and a per-camera noise floor measured during calibration.

## v1 scope
- Knife-edge mode only, single fixed reference frame, spacebar to re-reference.
- Requires a printed noise PDF taped to a wall (shipped with the page).
- One sensitivity slider and an FPS counter.
- No export, no audio, no particles.

## Out of scope
Quantitative density/temperature readout, phone cameras, video recording, stereo/tomographic reconstruction.

## Risks & unknowns
Many laptop webcams apply aggressive temporal denoise that erases sub-pixel shifts and cannot be disabled; rolling shutter distorts fast plumes. Unknown how many consumer cameras actually honor manual exposure constraints in Chrome.

## Done means
On an M1 laptop with its built-in webcam, a candle plume and a breath exhaled at a cold surface are both clearly visible at 30 fps, and the effect survives someone walking past the camera without needing recalibration.
