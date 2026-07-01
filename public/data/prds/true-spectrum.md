## Overview

True Spectrum renders visible light 380–750 nm the way it actually maps to human color — through CIE 1931 color-matching functions into the sRGB gamut — instead of the fake evenly-spaced rainbow everyone draws. The result looks *wrong* in a way that's true: the greens crowd, the violets dim, the spectrum is lumpy because your eyes are lumpy. Over the strip, brackets show which animals see which band — mantis shrimp 300–720 nm, bee 300–650 (into UV), dog 430–550 (dichromat), snake pit-organ into IR. Hover any nanometer value and hear a synthesized pitch mapped from that wavelength, so light becomes audible. The mantis-shrimp bracket does most of the social-media work.

## Problem

Every spectrum diagram on the internet is a lie: a linear rainbow gradient that has nothing to do with how wavelengths actually map to perceived color, or which of those wavelengths a given organism can even detect. "See through an animal's eyes" filters are crowded, but a *physically correct* spectrum strip with animal sensitivity bands overlaid on it is the fresh cut. The color science is well-defined and public; nobody has shipped the honest strip.

## How it works

A horizontal strip labeled in nanometers. Each column's color is computed from the CIE 1931 standard observer, so the perceptual bunching and the out-of-gamut dimming are visible. Below/over the strip, horizontal brackets mark each animal's sensitivity range, extending past the human-visible edges into UV and IR where the strip fades to gray (you can't render what you can't see — that gap is the point). Hover a wavelength: a tooltip shows nm + the animal set that sees it, and a Web Audio oscillator plays a pitch derived by scaling the light frequency down into audible range. A toggle switches between "what you see" and "what a bee/shrimp/dog sees" (approximate remap).

## Technical approach — specific: stack, real data sources/APIs, data model, key algorithms, the hard part

Stack: static site, Vite + TypeScript, Canvas for the strip, Web Audio API for pitch. No backend.

Data sources by name:
- **CIE 1931** color-matching functions (x̄, ȳ, z̄ tables, published/CVRL) — the color science core: wavelength → XYZ tristimulus.
- **NASA spectral libraries** — reference for wavelength/energy framing and IR/UV band edges.
- Published photoreceptor sensitivity ranges for the animal set (mantis shrimp, bee, dog, snake) from vision-science literature, hand-entered.

Data model: `spectrum[{nm, XYZ, rgb, in_gamut:bool}]`; `animals[{name, lo_nm, hi_nm, note}]`.

Key algorithms: (1) per-nm XYZ→linear sRGB via the standard matrix, then gamma; clamp/flag out-of-gamut samples and desaturate them honestly rather than hiding it. (2) wavelength→pitch: map nm to light frequency, halve it by a fixed number of octaves into ~200–2000 Hz. (3) animal remap: compress/shift the human strip to approximate that species' band (labeled "illustrative, not calibrated").

The hard part: gamut mapping done honestly. Many spectral colors are outside sRGB; the correct-looking desaturation (not naive clamp) is what makes the strip read as *true* rather than as a broken rainbow — and it's exactly the detail casual "spectrum" images fudge.

## v1 scope (humiliatingly small)

- One CIE-1931-correct spectrum strip, 380–750 nm.
- Four animal brackets (mantis shrimp, bee, dog, snake).
- Hover → nm + pitch synth.
- Precomputed CIE table baked into the bundle.

## Out of scope (for now)

- Calibrated animal-vision remaps (only illustrative).
- Non-visible band imagery (real UV/IR photos).
- Metamerism, spectral-power-distribution uploads, printer gamuts.

## Risks & unknowns

Prior-art verdict: **Partial**. "See through animal eyes" tools are crowded; the CIE-correct spectrum-strip angle plus animal-band brackets is the only fresh part. Fresh angle = the *honest* spectrum + the mantis-shrimp reach. Risks: (1) out-of-gamut colors can look muddy or "wrong" to viewers expecting a rainbow — lean into it with a caption; (2) animal remaps are approximations and could invite "actually…" corrections — label them illustrative; (3) pitch mapping is arbitrary — pick one convention and state it.

## Done means

A visitor sees a perceptually correct spectrum strip (visibly not a linear rainbow), reads the four animal bands including the mantis-shrimp range spilling into UV and IR, hovers a wavelength to hear its pitch, and shares a screenshot. Deployed static with the CIE table baked in.
