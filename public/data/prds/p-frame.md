## Overview
P-Frame is a macOS menubar toy that turns your own screen activity into an abstract print, updated live as your desktop wallpaper. It is a codec run backwards in intent: an encoder computes motion vectors as a disposable intermediate on the way to compressed pixels — P-Frame keeps the intermediate and destroys the pixels.

## Problem
Not a problem — an itch. Ambient generative wallpapers are all noise fields and Perlin flows generated from nothing; they're pretty but they aren't *about* anything. Meanwhile the most personal signal on your machine — where your attention physically moved across the glass all day — is computed thousands of times per second by every screen recorder and then discarded. The reason nobody makes art from screen activity is that screen content is radioactively private. Motion vectors aren't: they encode *that* something moved and where to, not what it was.

## How it works
1. Capture the display at 2–4 fps via ScreenCaptureKit into a hardware H.264 encoder.
2. Extract per-macroblock motion vectors and residual energy from the encoded stream. Pixels are never written to disk and never leave the encode buffer.
3. Accumulate vectors into a persistent 2D field at macroblock resolution, with exponential decay (half-life ~40 minutes) so the morning fades under the afternoon.
4. Render: seed a few thousand particles, advect them along the accumulated field, and draw streamlines with alpha proportional to dwell. Color maps to residual energy — blocks the encoder found *hard* to predict (video playing, text rapidly changing) glow hot; smooth drags render cool and long.
5. Write the canvas to a PNG every 60 seconds and set it as the desktop wallpaper. Menubar lets you pause, change decay, and export the day at print resolution at midnight.

## Technical approach
Swift app. Capture: `SCStream` → `VTCompressionSession` (H.264, low latency, fixed GOP of 30 so I-frames are predictable). Vector extraction: feed the compressed stream to libavcodec with `AV_CODEC_FLAG2_EXPORT_MVS`, read `AV_FRAME_DATA_MOTION_VECTORS` side data per frame — each entry gives source/destination block coordinates, block size, and motion delta; residual energy is approximated from per-macroblock coded bits. Field state is a `Float32` array of `(vx, vy, energy)` at 1/16 display resolution, checkpointed to disk so a reboot doesn't erase the day. Rendering is a Metal compute shader: an RK2 advection step per particle per frame, additive blending into a float texture, tonemapped on write. The genuinely hard part is that hardware encoders emit motion vectors optimized for *rate*, not for truth — a static desktop yields skipped blocks with zero vectors, and encoder noise produces speckle where nothing moved. So the pipeline needs a confidence gate (drop vectors whose block cost is below a threshold, median-filter the field spatially) or the wallpaper is snow. The second hard part is aesthetic: raw vectors are axis-aligned and blocky, and a naive streamline render looks like a broken TV rather than a painting.

## v1 scope
- Single display, fixed 2 fps.
- One visual preset, one color map, fixed decay.
- Renders to a PNG and sets the wallpaper; no live Metal wallpaper layer.
- Menubar: pause / resume / "save today" / quit.
- Field resets at midnight.

## Out of scope
Multi-monitor stitching, Windows/Linux, sound reactivity, per-app attribution or color-by-app (privacy line: no app identity is read), video export or timelapse.

## Risks & unknowns
Macroblock motion vectors may be too sparse at 2 fps to yield a coherent field — mitigation is to raise capture to 10 fps and accept the CPU cost, or synthesize flow with a cheap optical-flow pass (`VNGenerateOpticalFlowRequest`) instead of the codec, which weakens the conceptual joke. Continuous ScreenCaptureKit use costs battery and shows a persistent recording indicator, which some users will find unnerving even though nothing is stored. Unknown whether the output is beautiful or just busy; the decay half-life is likely the single parameter that decides.

## Done means
After running for one workday, the exported PNG visibly shows the shape of your day — a bright band where the editor scrolled, a cool arc where a window was dragged across displays, a hot patch where a video played — and a `dtrace`/Instruments check confirms no frame buffer is ever written outside the encoder, with sustained CPU under 8% on an M-series Mac.
