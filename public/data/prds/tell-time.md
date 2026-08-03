## Overview

A Linux CLI that answers one question existing reproducible-build tooling refuses to answer: *which line of my code read the clock?* You run `telltime -- make release`. It executes the build twice under a shim that feeds deliberately different values for every nondeterminism source, diffs the outputs, then automatically narrows down which intercepted call sites actually mattered. Output is `cmd/version.go:44 → time.Now() → affects bin/app @ 0x4f20`.

For: anyone who has a reproducible-build check failing in CI and a 400MB diff to stare at.

## Problem

`reprotest`/`rebuilderd` are black-box: vary the environment, rebuild, diff. When it fails you learn *that* your build is nondeterministic, then spend an afternoon with `diffoscope` reverse-engineering a byte offset back to a Go linker flag or a Python `set` iteration. Nobody attributes the divergence to a *call site*. The causal information exists at intercept time — it's just thrown away.

## How it works

1. **Perturb.** Run the build under a shim that returns different values per run for: `time`/`gettimeofday`/`clock_gettime`, `getrandom`/`/dev/urandom`, `gethostname`/`uname`, `getpid`, `readdir` ordering, and environment iteration order.
2. **Record.** Every intercept logs `(callsite_id, class, returned_value)`. `callsite_id` is a hash of the unwound return-address chain, resolved lazily via DWARF.
3. **Diff.** Content-hash every declared output. If run A ≠ run B, we have a live culprit set.
4. **Bisect.** Delta-debug (ddmin) over `{class × callsite}`: re-run with subsets *pinned* to fixed values until the minimal pinned set that restores byte-identity is found. That set is the answer.

## Technical approach

Rust, `LD_PRELOAD` shim for glibc wrappers plus `seccomp` user-notify (`SECCOMP_RET_USER_NOTIF`) for raw-syscall binaries that skip libc (Go, static Rust). Stack walking with `libunwind`; symbolization deferred to report time via `addr2line`/`gimli` so intercepts stay cheap. Directory-order chaos via a FUSE passthrough that permutes `readdir` with a per-run seed.

The genuinely hard part is **time**: `clock_gettime` is served from the vDSO and never traps. Fix is to unmap/poison the vDSO for the child (`AT_SYSINFO_EHDR` rewriting at exec) so calls fall back to the real syscall and become interceptable — with a fallback to `libfaketime` semantics when that breaks a runtime.

Second hard part: builds are slow, and ddmin is O(log n) *builds*. Mitigate by ranking candidates first — a call site whose returned bytes literally appear in the diverging output region is an immediate hit, no bisection needed.

## v1 scope

- `LD_PRELOAD` only, glibc-linked builds only
- Three sources: time, `getrandom`, hostname
- Two runs, byte-diff of one user-declared output file
- No ddmin — just print every call site of the classes whose bytes appear in the diff
- Text report, no HTML

## Out of scope

macOS/Windows. Container-image reproducibility. Network nondeterminism. Fixing anything automatically.

## Risks & unknowns

vDSO poisoning may break Go's runtime in ways that look like nondeterminism themselves. Backtrace cost inside a hot `time()` loop could 10× a build. Many real failures are *ordering*, not values — the FUSE readdir path is where the actual value is, and it's the riskiest piece.

## Done means

Given a Go project built with `-ldflags "-X main.buildTime=$(date)"`, `telltime -- make` prints the `date` invocation's call site and the byte range it controls, in under 3× the normal build time.
