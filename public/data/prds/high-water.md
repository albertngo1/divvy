## Overview
High Water is a single-page tool where you paste a PEG grammar and an input string and get back a picture of the parse *attempt* — not the resulting tree. The main plot is position-versus-step: X is the parser's step counter, Y is the offset into the input. A clean parse is a staircase climbing to the right. Catastrophic backtracking is an unmistakable sawtooth. For anyone writing parsers, DSLs, config formats, or grammars for a toy language.

## Problem
When a parser fails, you get one line: "expected X at line 12." When a parser is slow, you get nothing at all — just a spinner. Both symptoms come from the same hidden object, the search the parser actually performed, and no tool shows it. The furthest position reached (the "high water mark") is what error messages are usually derived from, yet it's presented as a scalar when it's really the peak of a curve worth looking at.

## How it works
Paste grammar, paste input, hit Trace. The parser runs instrumented and emits an event stream: `{step, pos, ruleId, kind}` where kind ∈ {enter, match, fail, memo-hit}. The canvas draws the polyline of pos over step; fails render as the drop back to the saved position, memo hits as short cyan ticks, and a horizontal red rule marks the high-water mark. The input text is rendered in a gutter along the Y axis, so a glance tells you *which token* the parser kept crashing into. Hover any point to get the full rule stack at that step. A toggle switches to a flamegraph view (rule tree, width = steps spent), because the two views answer different questions: the seismograph shows *where*, the flamegraph shows *who*.

## Technical approach
TypeScript, no backend. Grammar is compiled with Peggy; instrumentation wraps each generated rule function with an enter/exit shim that pushes into a preallocated struct-of-arrays trace buffer (`Int32Array` for step/pos/ruleId, `Uint8Array` for kind) — no object allocation in the hot loop, so tracing overhead stays roughly constant-factor and doesn't change the asymptotics you're trying to see. Rendering: a plain 2D canvas polyline for <200k events, with an on-the-fly LTTB downsample above that; the gutter uses a monospace line-index built once. Memoization is a switch, so you can plot the same grammar with and without packrat caching side by side. The hard parts: (1) instrumenting Peggy's generated code without forking it — the shim has to be injected into the action wrapper, and Peggy's optimized output inlines some rules, so ruleId attribution needs the source-map-ish position table; (2) keeping the trace bounded on pathological grammars, which means a step ceiling with a clearly marked truncation, not a silent cut.

## v1 scope
- One textarea for grammar, one for input, a Trace button
- Position-vs-step canvas plot with high-water line
- Click a point → rule stack readout
- Memoization on/off toggle, side-by-side compare

## Out of scope
- Non-PEG parsers (tree-sitter, ANTLR, hand-written recursive descent)
- Editing/fixing grammars, autocompletion, saving projects
- Streaming or multi-megabyte inputs

## Risks & unknowns
Peggy's optimizer may make step attribution lossy for inlined rules. And the plot may be beautiful but non-actionable — the flamegraph fallback is the hedge.

## Done means
Pasting a known-exponential PEG shows the sawtooth blowup within one screen, flipping memoization on visibly flattens the same plot, and clicking the peak names the rule that owns the high-water mark.
