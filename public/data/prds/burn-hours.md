## Overview
A physical-modeling synthesizer where each voice is an incandescent filament, and the audio signal is the **luminous flux** coming off it, not the electrical drive. For synth nerds, sound designers, and anyone who has played every string/reed/tube model and wants a new physical object to hit.

## Problem
Virtual instruments are lossless and infinite; nothing you do to them costs anything. Physical modeling has thoroughly mined strings, reeds, membranes, and tubes — but never the light bulb, which is a gorgeous nonlinear system hiding in plain sight: thermal inertia is a lowpass, T⁴ radiation is an asymmetric compressor, positive-tempco resistance self-limits hard drive, and the whole thing *ages irreversibly*.

## How it works
MIDI note → drive waveform at pitch → filament thermal ODE → spectral radiance → photopic-weighted flux → audio sample. Because the response is thermal, attacks are squelchy and asymmetric for free. Because resistance climbs with temperature, playing harder self-compresses instead of clipping.

Knobs are physical, not musical: filament diameter and coil pitch, fill gas (vacuum / argon / halogen), lead conduction. Halogen fill enables the real halogen cycle — evaporated tungsten redeposits — which becomes a slow self-repair mechanic.

Every note accrues **burn hours**, persisted to disk per bulb. Hot spots form where you play hardest; those segments thin, run hotter, thin faster. Eventually a filament flashes and dies mid-note: arc, then silence, permanently. New bulbs are procedurally generated with manufacturing tolerance, so diameter variance gives each one its own detune and timbre. Every bulb you'll ever own is unique and mortal.

## Technical approach
Web Audio `AudioWorklet` with the DSP in Rust→WASM. Model: lumped 1-D filament of N=32 segments; per segment `C·dT/dt = I²R(T) − εσA(T⁴−T_amb⁴) − k∇²T − h_gas·ΔT`, with tungsten resistivity from the Desai fit (ρ ≈ ρ₀(T/300)^1.2). Luminous flux from Planck's law integrated against CIE V(λ), precomputed as a flux-vs-T lookup table. Aging: Langmuir evaporation with the tungsten vapor-pressure Arrhenius fit gives dr/dt per segment — thinner segment → higher local R → hotter → faster evaporation. Thermal runaway and end-of-life emerge from the physics rather than being scripted.

Two hard parts. **Bandwidth:** a real bulb's τ is ~50 ms, far below audio. Scale the filament to micron diameter so τ ∈ [0.3, 5 ms], putting the thermal corner at 30–500 Hz — in band, and physically honest scaling. **Cost/stability:** a stiff nonlinear ODE, 32 states per voice, 8 voices, at 48 kHz with oversampling. Use an exponential integrator on the linear part with the T⁴ term handled semi-implicitly.

Save state is a small JSON per bulb: segment radii + burn hours.

## v1 scope
- Single voice, 8 segments, one bulb type
- On-screen keyboard + Web MIDI in
- Burn hours and segment radii persisted to localStorage
- A bulb can die, audibly, and stay dead

## Out of scope
AU/VST wrapper, halogen cycle, polyphony beyond 4, bulb marketplace, photoreal glass rendering.

## Risks & unknowns
Biggest risk: it just sounds like a lowpass into a waveshaper. Mitigation is an early A/B against that naive chain — if indistinguishable, the differentiator has to be hot-spot spectral drift and death, so build aging first, not last. CPU headroom in an AudioWorklet is the other unknown.

## Done means
Play a three-minute improvisation: spectral centroid drops ≥15% over the session, the thermal corner measurably shifts, one bulb visibly and audibly fails, and after a page reload the damage is still there.
