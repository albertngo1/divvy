## Overview
A desktop toy and screensaver for people who like making things but hate the infinite-undo, infinite-iteration feel of digital art tools. You keep a **vat** — a live reaction-diffusion field that evolves at wall-clock pace over 30 real days, hums audibly, and can only be touched once every 24 hours. At the end you bottle it. Bottles carry lineage; you can pour one into the next batch as starter.

## Problem
Generative art has a slot-machine problem: mash the seed button until something looks nice, screenshot it, feel nothing. The artifact has no history and no cost. Meanwhile the appeal of sourdough, wine, and forty-year-old fish sauce is exactly the thing digital tools remove — irreversibility, waiting, and a lineage you didn't personally author.

## How it works
- **The vat.** A 512×512 Gray–Scott reaction-diffusion field with feed rate F and kill rate k. It advances at a fixed, enforced 1 simulated hour per real hour. No scrubbing, no fast-forward, no reloading yesterday.
- **The feeding.** Once per 24h you get one intervention: paint a small mask that locally nudges (F, k) or injects chemical B. That's it. One brushstroke per day, thirty strokes per batch.
- **The hum.** The field is sonified continuously: a 2D FFT of the pattern is band-collapsed to ~24 partials driving an additive synth. Spot patterns hum as clustered inharmonic partials; stripes give a narrow tonal drone; a dying field decays to near-silence. You can hear when a batch has gone wrong from the next room.
- **Bottling.** After day 30 you export a **bottle**: a ~4KB file holding seed, the full timestamped intervention log, parameter timeline, and a lineage hash. Anyone can re-simulate it deterministically and get your exact image — the bottle *is* the artwork, the PNG is a print of it.
- **Starter.** A finished bottle can seed a new batch: 10% of its final field is blitted in, and its lineage hash becomes the child's parent. Bottles are tradeable as files; a shared starter drifts differently in every vat.
- **The mischief.** Export before day 30 and the bottle is flagged `young` forever, rendered with a visible marker, and refused as starter by the app. You can cheat your system clock. The lineage record will say you did.

## Technical approach
Tauri or Electron shell; simulation in a WGSL compute shader (ping-pong textures, ~200 Gray–Scott steps per simulated hour, so idle GPU cost is trivial). State checkpointed to a local SQLite file every simulated hour with a monotonic-clock delta plus wall-clock timestamp — divergence between the two is what flags tampering. Audio via Web Audio: an FFT of a downsampled 128×128 field each 2s, mapped to 24 oscillator gains with 2s slews so the timbre morphs instead of clicking. macOS screensaver target via a `.saver` bundle rendering the same texture read-only. The genuinely hard part is determinism: floating-point reaction-diffusion on a GPU is not bit-reproducible across vendors, so bottles must replay on a fixed-point or f32-with-fixed-order CPU path for verification, which has to visually match the GPU path closely enough that nobody feels cheated.

## v1 scope
- One vat, no lineage, no sharing
- Fullscreen window (not a real screensaver bundle yet)
- Daily feeding = one circular brush at one (F, k) preset
- Bottle export as JSON + PNG

## Out of scope
- Multiplayer / shared vats
- Marketplace, minting, any of that
- Mobile

## Risks & unknowns
- Thirty days is a long test cycle; needs a hidden dev-time-warp that's absent in release builds
- Gray–Scott may be too familiar visually — may need a second chemistry (Belousov–Zhabotinsky) for variety
- People may simply forget to feed it; a missed day should be a legible scar, not a failure

## Done means
A vat runs unattended for 72 real hours across sleep/wake, accepts exactly three feedings, sounds audibly different on day 3 than day 1, and its exported bottle replays on the CPU path to a visually indistinguishable image.
