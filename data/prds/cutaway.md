## Overview
Cutaway is a web toy for the-curious-about-what-code-becomes: paste a small C or Go function, and it renders the compiled assembly not as a wall of mnemonics but as an *illustrated exploded diagram* — the kind HN loves for pull-back cars and Postgres internals — where registers are labeled mechanical parts and executing the function animates data flowing through them.

## Problem
Assembly is the ultimate "how does this actually work" teardown, but Godbolt shows it as intimidating text. Beginners never build a mental *machine* for it. The internet adores illustrated cutaways of physical objects; nobody's applied that visual language to the CPU a function runs on.

## How it works
You pick a language and write a short function. Cutaway compiles it and lays out the instructions as a vertical "assembly line." Registers (rax, rbx, xmm0…) are drawn as distinct labeled components on a chassis. Stepping through — or hitting Play — animates each instruction: a `mov` slides a glowing token from one part to another, `add` merges two tokens with a little gear turn, `jmp`/`cmp` draw a branching track. Like the pull-back car's spring→gears→wheels, you see stored values become motion. Hover any part for its plain-English role.

## Technical approach
Stack: static site + a compile backend. Reuse Compiler Explorer's public API (`godbolt.org/api/compiler/<id>/compile`) to get assembly JSON for gcc/clang/go — no local toolchain needed. Parse the AT&T/Intel output into an instruction model `{op, operands[], sourceLine}`. Build a tiny register-transfer interpreter for a *subset* of x86 (mov, add/sub, mul, cmp, conditional jmps, push/pop, ret) so we can drive the animation with real semantic steps rather than faking it. Render with SVG + a spring/tween lib (Framer Motion or GSAP). The genuinely hard part: honest-but-legible layout — real assembly has more ops than we animate, so we gracefully "black-box" unmodeled instructions as sealed components that still pass tokens, keeping the diagram truthful without implementing all of x86.

## v1 scope
- Paste one C function, compile via Godbolt API
- Render registers + instructions as a static exploded SVG
- Step button that highlights the current instruction
- Animate mov/add/sub token flow only

## Out of scope
- Full x86 semantics, SIMD, memory/stack visualization beyond push/pop
- Multiple compilers/optimization-level comparison UI
- Saving/sharing permalinks

## Risks & unknowns
Godbolt API rate limits/ToS for a public toy; optimized output can be unrecognizable vs source (default to `-O0`); mapping arbitrary asm to a clean visual metaphor may break on register spills or complex addressing modes.

## Done means
Paste `int add(int a,int b){return a+b;}`, get an exploded SVG showing edi/esi feeding an adder into eax, and pressing Step animates the two argument tokens flowing into the return register.
