## Overview

Pressure Atlas takes the peak contact pressure at the moment a ball is struck — golf driver impact, tennis serve, soccer boot, baseball bat, ping-pong paddle — and turns it into a press-and-hold "thumbpad." Every sport's ball-at-impact pressure is measured in MPa in biomechanics journals; here you press a virtual pad and see the deformation, the contact-patch size, and a scaled pressure gauge for each sport, so you can *compare by pressing* rather than reading a table. A golf ball squashes into a coin-sized welt at hundreds of atmospheres; a beach ball barely dents. The atlas is a grid of these presses side by side.

## Problem

Biomechanics papers report per-ball contact pressures at impact, but they live as isolated numbers in isolated studies. There is no single artifact that lets you compare them by feel — no cross-sport "press this" that puts golf, tennis, and soccer on one scale. The novelty is the aggregation and the press interaction, not the measurement.

## How it works

A grid of sports, each a circular "thumbpad." Press and hold one: the ball graphic deforms — contact patch spreads, the ball flattens by an amount scaled to real deformation, and a radial gauge fills to that sport's peak MPa. Release and it rebounds. A shared logarithmic pressure axis down the side lets you see that a golf-driver strike is orders of magnitude above a volleyball bump. Press two pads at once (multi-touch) to feel the gap. Each pad footnotes its source study and impact conditions (swing speed, ball mass).

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: static site, Vite + TypeScript, SVG/Canvas for deformation, pointer + touch events (multi-touch on the pads). No backend.

Data sources by name:
- **Biomechanics journals** — per-sport peak contact pressure / contact force + contact area at impact (e.g. Journal of Sports Sciences, Sports Engineering, sports-biomechanics impact studies). Values hand-extracted per sport with citation, impact conditions, and ball spec.
- Derive pressure = force / contact-area where papers give force + patch instead of MPa directly.

Data model: `sports[{id, name, ball, peak_MPa, contact_area_mm2, impact_note, source}]`. Deformation amount derived from `peak_MPa` on a log scale normalized across the set.

Key algorithms: (1) log-normalize peak MPa across all sports to a 0–1 fill for the gauge and a deformation factor for the ball graphic; (2) press dynamics — a simple spring easing so hold ramps to peak and release rebounds; (3) contact-patch spread scaled to real `contact_area_mm2`.

The hard part (and the live risk): a screen can't render pressure as a haptic sensation. Without a trackpad force sensor (Apple Force Touch is the only broad one, and web access is limited), "feeling" pressure leaks into a purely visual encoding — a gauge and a squash animation, which is weaker than the drag-resistance of Mohs. The build has to lean hard on the *comparison* (side-by-side log scale) to carry the point, and honestly may need to be cut if no better sensory channel is found.

## v1 scope (humiliatingly small)

- 6–8 sports, hand-entered peak MPa + contact area + source.
- Press-and-hold pad → deform ball + fill gauge.
- Shared log pressure axis for comparison.
- One precomputed `sports.json`.

## Out of scope (for now)

- Real force-sensor / haptic input.
- Time-resolved impact curves (force over the contact milliseconds).
- Non-ball impacts (fist strikes, club-head-on-tee).

## Risks & unknowns

Prior-art verdict: **Open**. Biomechanics papers report per-ball pressures, but no cross-sport thumb-press artifact exists. Fresh angle = aggregation + press-to-compare. The dominant risk is the one flagged at ideation: haptic-equivalent visuals don't actually convey pressure without a force sensor, so perceptual encoding leaks — this idea is a candidate to cut unless a better sensory channel (Force Touch, audio pitch = pressure, controller rumble) is found. Secondary risk: sourcing consistent, comparable MPa figures across sports measured under different conditions.

## Done means

A visitor presses a golf pad and a volleyball pad, sees the golf ball weld into a tiny high-pressure patch while the volleyball barely dents, reads both against a shared log MPa axis, and every value is cited to a biomechanics source. Deployed static — OR a documented decision to cut for lack of a real pressure channel.
