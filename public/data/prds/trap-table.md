## Overview
A static explorable-explanation site plus a downloadable dataset of Linux's system call numbering: which syscall got which number, on which architecture, in which kernel release, and what happened to the numbers nobody uses anymore. For kernel-curious readers, seccomp filter authors, emulator/libc porters, and anyone who has ever run `strace` on aarch64 and wondered where `open` went.

## Problem
Syscall numbers are the most load-bearing magic numbers in computing and there is no map of them. They are also a fossil record: `mmap2` exists because of 32-bit page offsets; arm64 has no `open`, only `openat`, because it started clean on `asm-generic/unistd.h`; a whole shoal of `*_time64` calls (403–428) surfaced in 5.1 for the 2038 problem; x32 hides its ABI above 512 — a genuine seccomp bypass footgun when a filter forgets the `__X32_SYSCALL_BIT`. Today you learn this by grepping `.tbl` files. Nobody has rendered it, and it is a genuinely beautiful matrix.

## How it works
One page. A tall heatmap: rows are syscall names (sorted by first appearance), columns are architectures, cells colored by number band, blank where the arch never had it. A release slider from 2.6.12 to today animates the matrix growing. Hovering a cell gives arch, number, ABI column, entry symbol, the release it appeared in, and the man-page one-liner. Four annotated tour stops walk the greatest hits: the 2038 batch, the OABI/EABI split on arm, the asm-generic reset, and the numbers that are permanently dead (`uselib`, `nfsservctl`, `create_module` — retired but unreusable, because ABI is forever).

## Technical approach
Shallow-clone `linux.git`, then for each release tag `git show` the syscall sources rather than checking out: `arch/*/entry/syscalls/syscall_*.tbl` (whitespace-delimited `nr abi name entry compat`), and `include/uapi/asm-generic/unistd.h` for the table-less arches, which needs a tiny resolver for the `#define __NR_openat 56` / `__SYSCALL(__NR_openat, sys_openat)` chain (`pycparser` is overkill; a 60-line regex + symbol table works). Pre-3.x x86 lived in `syscall_table_32.S` — handle it or declare the epoch at 3.0.

Normalize into DuckDB: `syscall(release, arch, abi, nr, name, entry, is_stub)`. Export Parquet + a compact JSON pivot for the frontend. Site is plain Vite + D3, matrix drawn to canvas (≈450 rows × 22 cols × 60 releases is too much for SVG).

The hard part is name identity: `compat_sys_*` twins, `sys_ni_syscall` placeholders that mean "reserved, never wired", the ppc `spu` ABI column, and deciding that `fstatat64`/`newfstatat` are the same idea. Ship the equivalence table as data so people can argue with it in a PR.

## v1 scope
- x86_64, arm64, riscv64 only
- One `.tbl`/`unistd.h` parser, tags at `X.0` releases only
- Static matrix + hover card, no time slider
- Parquet download

## Out of scope
Other kernels, live `strace` integration, generating seccomp profiles, ioctl numbers (a worse swamp, save it for v2).

## Risks & unknowns
Parsers rot backward through history; the man-pages join is fuzzy; the whole thing is a one-shot artifact unless a nightly GitHub Action re-runs it against `master`.

## Done means
A single URL where, in two clicks, someone can answer "when did `pidfd_open` appear and what number is it on riscv64" and "which syscalls exist on x86_64 but not arm64", and download the full matrix as one Parquet file.
