## Overview
Colorburst is a generative art toy / live wallpaper that runs cellular automata but renders them through a physically-simulated NTSC composite-video pipeline — and, crucially, feeds the resulting analog artifacts back into the automaton so the signal degradation becomes part of the life. It's for people who love both `Mr. Baby Paint`-style emergent CA and the wobbly, bleeding aesthetic of old game consoles on a CRT.

## Problem
CA art usually renders crisp, clinical pixels; retro-shader projects usually just filter a static image. Nobody closes the loop. The itch: what if the color bleed, dot crawl, and phase wobble that plague composite video weren't a post-effect but an actual force in the simulation — a second, analog physics stacked on the digital one?

## How it works
A base grid runs a tunable multi-state CA (Life-like, cyclic, or a Lenia-ish continuous rule). Each frame's state is encoded into a fake NTSC luma+chroma waveform, corrupted (limited bandwidth, chroma/luma crosstalk, colorburst phase error, ringing), then decoded back to RGB. The decoded, artifact-laden values are quantized and injected as perturbations into the next CA generation. Users drag sliders for signal quality, rule set, and feedback strength, watching the ecosystem shift from stable to gorgeously unstable.

## Technical approach
Stack: TypeScript + WebGL2 (or WebGPU where available), everything in fragment shaders as ping-pong framebuffers. Pipeline per frame: (1) CA update shader; (2) RGB→YIQ encode into a simulated composite line-buffer; (3) NTSC corruption shader modeling limited chroma bandwidth, dot crawl from luma/chroma sharing a subcarrier, and per-line phase wobble (nod to the NES composite article); (4) YIQ→RGB decode; (5) feedback shader that maps decoded artifacts back into CA cell states. Data structures are just RGBA float textures; the key algorithm is the encode/decode using a colorburst reference phase per scanline. The hard part is keeping the feedback loop on the knife-edge between dead (converges to static) and blown-out (saturates to noise) — needs an auto-normalizing energy clamp.

## v1 scope
- One CA rule + one composite-corruption shader with 3 sliders
- Feedback toggle so you can see with/without
- Runs at 60fps full-screen in a browser tab
- Export current frame as PNG

## Out of scope
- Multiple CA families, presets gallery, audio reactivity
- Native macOS wallpaper packaging
- Saving/sharing parameter seeds

## Risks & unknowns
- Feedback may be too chaotic to be pretty without heavy tuning
- WebGPU vs WebGL2 portability for float feedback textures
- Perf on integrated GPUs at 4K

## Done means
Opening the page shows a living CA visibly distorted by composite artifacts, and toggling feedback off/on produces two clearly different emergent behaviors — not just a cosmetic filter.
