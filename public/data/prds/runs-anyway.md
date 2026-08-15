## Overview
A macOS/Linux screensaver and desktop toy that treats the CHIP-8 instruction set as a generative art medium. It does not run existing ROMs. It manufactures new ones — random bytes, mutated bytes, bred bytes — runs them in a real interpreter, and displays only the tiny fraction that produce living imagery on the 64×32 monochrome display. For people who like emergence, demoscene aesthetics, and the idea that a program can be found rather than written.

## Problem
Generative art usually means someone designed the generator: noise, flow fields, L-systems. The output space is the artist's taste, sampled. CHIP-8 is a rare substrate where random data is *executable* and occasionally gorgeous — 4KB of address space, 35 opcodes, a sprite-XOR display that turns junk arithmetic into interference patterns. Nobody has mined that space, because 99.9% of random ROMs halt, blank, or lock in a 2-frame loop, and no one wants to watch those.

## How it works
A background miner runs headless at low priority. Each candidate ROM (bytes 0x200–0xFFF) is executed for 8 simulated seconds at 500Hz with a 60Hz display tick, and scored on the frame buffer alone:
- **Alive**: pixel-change rate per frame in a healthy band (not frozen, not full static)
- **Structured**: 2D FFT of the accumulated frame has energy off the DC bin but isn't white
- **Non-periodic**: hash the framebuffer each tick; reject cycles under 240 frames
- **Coverage**: fraction of the 2048 pixels ever touched
Survivors enter a hall of fame. New candidates come 20% from fresh random bytes, 80% from mutating hall-of-fame members (byte flips, nibble swaps, splicing two parents at an even address). Novelty search, not pure hill-climb: a candidate is kept if its FFT signature is far from every stored signature, so the gallery diversifies instead of converging on one throbber. The screensaver plays the gallery, crossfading, with the ROM's own hex quietly scrolling in a corner.

## Technical approach
CHIP-8 core in Rust (~400 lines; the hard part is faithful quirks — VF flag on 8XY6 shift, I-register increment on FX55, sprite wrap) compiled twice: native for the miner, wasm for a web gallery. Miner runs N threads, each ~2000 ROMs/sec headless. Scoring uses a 64×32 f32 accumulator and `rustfft` on a 64×32 real FFT; signatures are the 32 largest-magnitude bins quantized to 4 bits, compared by Hamming distance in a BK-tree. Hall of fame is SQLite: rom BLOB, signature, scores, discovery timestamp. Rendering via a ScreenSaver bundle (Swift + Metal) drawing the wasm/native core's framebuffer with CRT bloom. Genuinely hard part: the fitness function. Every naive metric rewards static-like noise, and every anti-noise term rewards a blinking rectangle. Expect a weekend of tuning against a hand-labeled set of ~100 candidates.

## v1 scope
- CLI miner that dumps the top 20 ROMs found in one overnight run as GIFs
- Four fitness terms, hardcoded weights
- Random + byte-flip mutation only
- Plays back in a terminal window, no ScreenSaver bundle

## Out of scope
- Sound (CHIP-8 buzzer is one tone)
- SUPER-CHIP / XO-CHIP extensions
- Interactive input to the found ROMs
- Sharing/gallery site

## Risks & unknowns
The space may be thinner than hoped — random CHIP-8 could be 99.999% dead, making mining feel like nothing. Mitigation: seed the population with a hand-written 12-byte draw-and-loop skeleton so mutation starts from something that already renders. Second risk: the gallery converges to one visual family; novelty search plus periodic full-random injection is the hedge.

## Done means
An 8-hour unattended run on a laptop produces at least 15 ROMs that a stranger, shown as looping GIFs with no explanation, would call "deliberate" — and no two of them look like the same effect.
