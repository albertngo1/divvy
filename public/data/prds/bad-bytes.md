## Overview

A browser puzzle game in the Zachtronics tradition, but rotated 90 degrees: existing assembly games grade you on cycles, instructions, or speed. Bad Bytes grades you on the *encoding* — the literal bytes your instructions assemble into. For programmers who like constraint golf, CTF players who learned this the hard way, and anyone who has ever noticed that `x86` has four ways to encode the same `mov` and wondered why that would ever matter.

## Problem

Machine-code encoding is one of the few remaining genuinely alien parts of computing, and the only people who ever learn it are exploit developers, who learn it under duress. Nothing teaches it playfully. Meanwhile assembly games all optimize the same two axes (size, speed) and none touch the axis where the weirdness actually lives: that `xor eax,eax` is `31 C0` but `sub eax,eax` is `29 C0`, and one day exactly one of those will be legal for you.

## How it works

Each puzzle gives a **behavioral goal** and a **byte constraint**, and you must satisfy both.

- Goal: "leave 0 in `rax`" — Constraint: *no byte may be 0x00*
- Goal: "copy 8 bytes from `rsi` to `rdi`" — Constraint: *every byte in 0x20–0x7E (printable ASCII)*
- Goal: "return `rdi * 5`" — Constraint: *the byte sequence must be a palindrome*
- Goal: anything — Constraint: *your code must contain the ASCII substring `DEAD`*

You type asm in a Monaco editor. The right pane shows a live hex dump with every constraint-violating byte glowing red — that pane is the game. You watch a byte turn green when you swap `mov eax, 0` for `push 0x30; pop rax; xor al, 0x30`, and the mechanic teaches itself.

Behavior is verified by executing your bytes in an emulator against hidden test vectors. Scoring is byte count; par is shown, and a histogram of everyone's byte counts appears after you solve. Six puzzles a week, escalating: the campaign's late puzzles stack constraints (printable *and* no repeated byte), which is where it stops being cute and becomes a real search problem.

## Technical approach

All client-side, so the puzzles are cheat-resistant only in the social sense and the server stays free.

- **Assembler:** Keystone Engine compiled to WASM, x86-64 mode. Assembly errors surface inline.
- **Emulator:** Unicorn Engine (WASM build). Map a 1MB code page and a stack page, set registers from the test vector, run with an instruction-count cap of 100k and a hook that aborts on any memory access outside mapped pages. Compare final registers/memory to expected.
- **Constraint engine:** each puzzle ships a predicate over `Uint8Array` — a small DSL (`forbid([0x00])`, `range(0x20,0x7e)`, `contains("DEAD")`, `palindrome()`) so puzzle authoring is a JSON blob, not code.
- **Data model:** `puzzle {id, arch, goal_spec, tests[], constraint_ast, par}`; solutions stored in localStorage plus an optional anonymous POST of `{puzzle_id, byte_count, sha256(bytes)}` for the histogram — never the source, so nobody's solution leaks.

The hard part is puzzle *design*: a constraint must be satisfiable, non-obvious, and not solvable by one canonical trick everyone already knows. Solution: an offline generator that enumerates short instruction sequences with a bounded search over Keystone output, so I can verify a puzzle is solvable, measure how many distinct solutions exist under 20 bytes, and set par honestly rather than by guess. Puzzles with exactly one solution get thrown out — they're trivia, not puzzles.

## v1 scope

- x86-64 only, register-to-register puzzles only (no memory, no syscalls)
- 8 hand-authored puzzles, 3 constraint types (forbid-byte, printable-range, contains-substring)
- Editor + live hex dump + pass/fail + byte count
- No accounts, no leaderboard, localStorage progress

## Out of scope

- ARM64/RISC-V modes, self-modifying code puzzles, syscalls or real I/O
- Multiplayer, daily streaks, anything social
- Producing actually-usable exploit payloads — puzzles run in an emulator against toy goals

## Risks & unknowns

Keystone + Unicorn WASM builds are heavy (several MB) — needs lazy loading and may be slow on mobile. The audience that enjoys this may be very small. Constraint difficulty is hard to calibrate: printable-ASCII x86 is a well-documented art with published cheat-sheets, so early puzzles may be one search away from spoiled — later puzzles must combine constraints in ways no writeup has covered.

## Done means

Eight puzzles playable in a browser tab; a fresh player with basic asm knowledge solves puzzle 1 in under 5 minutes and puzzle 8 in under an hour; the hex pane correctly turns every violating byte red in real time; and the offline generator confirms each puzzle has ≥3 distinct solutions at or under par.
