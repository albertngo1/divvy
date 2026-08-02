## Overview

Involute is a solo browser toy: you design a gear train on a canvas, spin it with a motor, and *hear it*. Every mesh sings its own gear-whine tone, and the whole machine is a drone instrument. The constraint is the art: gears have whole numbers of teeth, so frequency ratios are always rational. You literally cannot build a tempered semitone. For anyone who likes physical-modeling synths, mechanical drawings, or tuning-theory rabbit holes.

## Problem

Synths give you a pitch knob and infinite freedom, which is why most generative music toys sound like every other generative music toy. Real machines are interesting because they *can't* do most things. A gearbox is a tuning system that already exists in the world, nobody has played it, and its constraints (integer teeth, coprime hunting ratios, contact ratio) map exactly onto musical ideas (just intonation, polyrhythm, timbre).

## How it works

Drag gears from a palette; they snap into mesh when center distance equals m(z₁+z₂)/2. Each gear shows its tooth count z. One gear is the motor — its rpm is the tempo. Each **mesh** emits a tone at the mesh frequency f = rpm·z/60, plus harmonics, plus sidebands at each shaft's rotation frequency caused by transmission error. Add a compound gear (two gears on one shaft) and you branch the train, dividing frequency by a rational factor.

The magic moment: pick tooth counts 30 and 45 and you get a perfect fifth — pure 3:2, beatless. Try to get an equal-tempered fifth and you cannot, ever. A "ratio finder" panel shows the Stern–Brocot tree of buildable ratios near a target interval, given a max tooth count, with cents error — the explorable-explanation core.

Second mechanic: give a gear a **defect tooth** (a chip). Now it clanks once per revolution. With coprime tooth counts (a hunting ratio), that chip meets a different mate tooth every rev and the clank pattern only repeats after LCM(z₁,z₂) engagements — a polyrhythm whose period is number theory, not a sequencer.

## Technical approach

- Stack: vanilla TS + WebGL2 for rendering, WebAudio AudioWorklet for the DSP. No backend; state serializes into the URL hash.
- Gear rendering: parametric involute curve x = r_b(cos t + t sin t), y = r_b(sin t − t cos t), instanced per tooth; animate mesh by driving each gear's phase from a single shaft-angle integrator so teeth visibly interlock.
- Audio per mesh: an additive bank of 8 harmonics of f_mesh, each ring-modulated at the two shaft frequencies to synthesize the classic ±1× sideband skirt of gear whine. Harmonic rolloff is driven by **contact ratio** — compute it from module, pressure angle (20°), and addendum; higher contact ratio ⇒ steeper rolloff ⇒ mellower tone. That single physical parameter is the tone knob, and it's real.
- Defect clank: an impulse into a modal resonator (3–5 biquads) fired on tooth-engagement index.
- Hard part: keeping the audio graph phase-coherent when the user re-meshes a live train, and preventing aliasing when high tooth counts push f_mesh above Nyquist (fold harmonics out with a per-mesh harmonic cap).

## v1 scope

- Fixed module, spur gears only, max 6 gears
- Motor rpm slider, drag-to-mesh, tooth-count spinner
- Additive mesh tone + contact-ratio rolloff
- Cents-vs-just readout on every mesh

## Out of scope

Helical/bevel/planetary gears, recording/export, MIDI, wear simulation, mobile touch layout.

## Risks & unknowns

The whine spectrum may sound like a plain sawtooth unless the sidebands are tuned by ear; six simultaneous additive banks may be too CPU-hungry in an AudioWorklet; "just intonation only" could read as a bug rather than the point, so the cents readout has to teach it fast.

## Done means

A 30-tooth motor driving 45- and 40-tooth gears renders an interlocking animation at 60fps and sounds a beatless 3:2 and a 4:3 simultaneously; adding a chipped tooth produces a clank pattern that audibly repeats only after the LCM period.
