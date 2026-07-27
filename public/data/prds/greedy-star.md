## Overview
Greedy Star is a browser instrument for people who like constraint-driven generative music. You write a regex and a subject string; a hand-built backtracking regex VM tries to match them, and every step of that doomed search is sonified. The composition *is* the search tree.

## Problem
Generative music toys are usually either random (Perlin noise into a pentatonic scale, boring after 20 seconds) or hand-sequenced (not generative at all). What's missing is a generator with genuine *structure*: nested repetition, motifs that recur at different scales, and sudden collapses. Catastrophic backtracking has exactly that shape — a recursive, self-similar, deterministic search tree that fans out exponentially and unwinds in cascades — and nobody has ever listened to it.

## How it works
You type a pattern like `(a+)+$` and a subject like `aaaaaaaaaaaaaaaaaaaaaaab`. The VM steps at a chosen tempo (say 8 steps/beat) and each step emits an event:
- backtrack stack depth → scale degree (pitch rises as the engine commits deeper)
- opcode class → voice: CHAR = plucked string, SPLIT = pad swell, POP/fail = percussive click, SAVE = bell
- position in the subject → stereo pan and filter cutoff
- a fail cascade of *n* consecutive pops → a descending run of length *n*

Because the search tree is self-similar, phrases emerge for free: a motif, the same motif shifted, a longer variation, a collapse, repeat. Controls are pattern, subject, tempo, mode, step budget, and a **greed toggle** that flips every quantifier lazy — the same pattern, audibly inverted. Export WAV; the permalink encodes the whole piece in ~40 bytes of URL.

## Technical approach
TypeScript + WebAudio. You cannot use JS `RegExp` — it's optimized and opaque — so ship your own engine: recursive-descent parser → AST → instruction array (`CHAR`, `CLASS`, `SPLIT`, `JMP`, `SAVE`, `BACKREF`, `MATCH`). Backreferences stay in, because they're what makes the exponential blowup rich rather than merely long. The VM is an explicit stack machine, not recursion, so it can yield every N steps and keep the audio scheduler fed. Events cross into an AudioWorklet through a `SharedArrayBuffer` ring buffer with ~200ms lookahead; synth is 4 wavetable voices, one biquad each, one convolution reverb.

The genuinely hard part is dynamic range: traces span 10⁰ to 10⁷ steps. Needs adaptive time compression — play at true step rate while stack depth is still growing, then downsample by tree level once a region is provably self-similar, so an exponential blowup becomes a two-bar accelerando instead of an hour of clicking. The mapping must also be *stable*: editing one character of the pattern should produce a recognizable variation, not unrelated noise.

## v1 scope
- Literals, `.`, char classes, `*` `+` `?` `{m,n}`, groups, alternation, anchors, backrefs
- One synth patch, one scale (dorian), fixed tempo slider
- Live playback + hard step budget (10M) so nobody hangs their own tab
- Shareable URL

## Out of scope
MIDI export, unicode property escapes, DFA/NFA-simulation mode, multi-pattern layering.

## Risks & unknowns
It may just sound like a broken printer; the mapping tuning *is* the product. Time compression could destroy the very structure that makes it musical.

## Done means
`(a+)+$` against 24 `a`s and a `b` yields a ≥90-second piece with audibly recurring motifs, no audio dropouts, a working WAV export, and a URL a stranger can open and hear the identical piece.
