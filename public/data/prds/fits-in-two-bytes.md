## Overview

A single-player browser puzzle game about opcode space as a scarce resource. You are handed a 16-bit encoding space and a stream of real programs. You decide which instruction forms exist and how many bits each field gets. The game then re-encodes actual compiled code through your table and scores you on total bytes and decoder complexity. For anyone who has ever read an ISA manual and thought "why is *that* a whole instruction?"

## Problem

ISA design is the most consequence-dense engineering there is — a bad field-width choice haunts a chip family for forty years — and it is completely invisible to non-specialists. The internet argues about RISC-V versus ARM64 versus Thumb-2 constantly, almost entirely without touching the actual tradeoff: encoding space is a fixed budget, and every design is somebody spending it. There's no way to *feel* that. Nothing else in games is shaped like it: an inventory-management puzzle where the inventory is 65,536 bit patterns and the loot is other people's software.

## How it works

**Run structure.** Each run is 5 floors. A floor deals you a **workload card** — `bytecode interpreter`, `crypto kernel`, `bootloader`, `DSP filter`, `string-heavy CLI` — and each card is backed by a real compiled program. You spend budget adding instruction *forms* to your encoding table:

- pick a mnemonic class (ALU-reg, ALU-imm, load/store, branch, call, shift, multiply-accumulate)
- pick the field widths (register file size, immediate width, offset width)
- the game computes how many of your 65,536 slots that form consumes: `2^(sum of field widths)`

Add `add rd, rs1, rs2` with 5-bit registers and you just spent 32,768 slots — half your entire ISA — on one instruction. Drop to 3-bit registers and it costs 512, but now the register allocator spills constantly and every workload gets longer.

**Scoring.** Press *Assemble* and the game re-encodes each floor's program through your table, using a **legalizer** that expands anything you can't express: no 12-bit immediate? Every constant becomes a two-instruction `lui`-style pair. No multiply? Shift-add sequences. Final score = total static bytes across all floors, penalized by an estimated decoder gate count, compared against RV32IMC, Thumb-2, and x86-64 measured the exact same way. Beating Thumb-2 on a mixed workload is the boss fight.

**The trap that makes it a game:** floors 1–2 tempt you into a beautiful clean orthogonal encoding, floor 4 deals you the interpreter with its indirect jumps and huge switch table, and you have no slots left.

## Technical approach

TypeScript + Canvas, fully static, no backend. The corpus is precomputed offline: take prebuilt riscv64 Debian binaries (`busybox`, `sqlite3`, `lua`, `zlib` test harness), `objdump -d` them, and canonicalize each instruction into an abstract tuple `{op, dstIdx, srcIdx[], immValue, kind}` — stripped of RISC-V's own encoding decisions. Ship a few thousand of these tuples per workload as a compact JSON blob. Register pressure is precomputed too: for each program, a table of "bytes added per register removed," derived by re-running a linear-scan allocator offline at register-file sizes 4/8/16/32 and recording the spill counts.

Encoding validity is a **prefix-code check**: forms are inserted into a binary trie over the 16-bit space; any overlap is a build error surfaced as a red conflict marker, exactly like a Huffman-code violation. Decoder cost is estimated as the number of distinct field-extraction positions plus trie depth — crude, but monotone in the right direction and explainable in one tooltip.

Hard part: the legalizer. It must expand *any* op the player failed to provide into a correct sequence using whatever they did provide, and prove the ISA is Turing-complete enough to run at all (otherwise scores are meaningless). v1 handles this by making a minimal core set mandatory and free.

## v1 scope

- 2 workload cards, 1 real binary each (busybox `ls`, a Lua interpreter loop).
- 6 instruction form templates with 2 tunable field widths each.
- Trie conflict checker + slot-budget meter.
- Score screen: your bytes vs RV32IMC and Thumb-2 baselines. No progression, no meta-unlocks.

## Out of scope

Actual execution/simulation, cycle counts, pipelining, superscalar issue, custom mnemonics, variable-length encodings, a compiler backend.

## Risks & unknowns

The register-pressure model is the weakest link — precomputed spill tables ignore how the player's specific ISA changes allocation. If it's too crude, tiny register files look free and the optimal play is degenerate. Also unclear whether the fantasy survives contact with non-specialists; the game may need a 60-second tutorial floor that lets you feel one bad width choice cost 8 KB.

## Done means

A player can build an encoding, hit Assemble, and see real byte counts for two real programs within 2 seconds; a deliberately bad table (3-bit registers, no immediates) produces at least 2× the code size of a good one; and the RV32IMC baseline, run through the same legalizer and scorer, lands within 15% of its true measured `.text` size.
