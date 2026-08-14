## Overview
A CLI profiler for backend engineers that attributes *physical bytes written to disk* back to the exact log statement that caused them. You wrap your process, hammer it with a representative workload, and it hands you a flamegraph-style ranking: `logger.debug("tick %d")` at `worker.py:214` → 110KB/call amortized, 41GB/day, 3.2% of this SSD's rated TBW. It turns an invisible, deferred cost into a line-by-line budget.

## Problem
The systemd issue that hit the HN front page (a single log line generating 49KB on ext4, 110KB on btrfs of journald writes) is the tip of an iceberg every backend has. Logging feels free at the call site. It is not: journald metadata, fsync barriers, filesystem journaling, and copy-on-write amplification mean a 40-byte message can cost thousands of bytes to durable storage. Nobody attributes that back to a call site because writeback is asynchronous and batched — the write happens far from the `log()` call, so profilers lose the thread.

## How it works
1. You run `writetax -- ./your-service` (or attach by PID) and drive a workload.
2. It traces two layers at once: userspace log-emitting calls (via uprobe/USDT on your logging lib, or an LD_PRELOAD shim on `write`/`writev` to known log fds) and the block layer (`block_rq_issue`, `writeback_dirty_page`).
3. It correlates deferred block writes back to originating call sites by tagging dirtied inodes/offsets with the call stack that dirtied them, then reconciling at flush time.
4. Output: a ranked table + optional flamegraph SVG, each call site annotated with bytes-to-disk/call, amplification factor vs message size, projected GB/day at observed rate, and TBW-budget percentage from the drive's SMART rated endurance.

## Technical approach
Rust host + libbpf-rs (CO-RE eBPF) for the block/writeback tracepoints; ring buffer to userspace. Call-site attribution via frame-pointer/DWARF unwinding at the log syscall, keyed to a (dev, inode, offset-range) map that survives until writeback fires. Filesystem awareness matters: detect ext4 vs btrfs vs xfs to model journaling/CoW amplification. Pull `Percentage_Used` / `Total_LBAs_Written` from `smartctl -j` for the TBW math. The genuinely hard part is the dirty-page → call-site join across async writeback under batching and page merging; approximate with proportional attribution when a flushed page was dirtied by multiple sites.

## v1 scope
- Linux + eBPF only; ext4 and btrfs models.
- LD_PRELOAD shim for glibc `write`/`writev` to fds pointing at journald socket or log files.
- One-shot report: top-20 log call sites by bytes-to-disk, with amplification and daily projection.
- Static SVG flamegraph.

## Out of scope
- macOS/Windows, container-boundary tracing, live TUI, remote aggregation, non-logging write attribution.

## Risks & unknowns
- eBPF permissions/kernel-version skew (needs CAP_BPF, recent kernels).
- Async writeback attribution accuracy — may need conservative "±" bands.
- Frameworks with custom async log sinks may hide the fd behind a queue thread; stack unwinding then points at the flusher, not the caller.

## Done means
On a synthetic service logging a fixed 40-byte line N times/sec, the report attributes ≥90% of measured device writes (cross-checked against `iostat` deltas) to that call site, and its per-call byte figure lands within 20% of the ground truth I compute by hand for ext4 and btrfs.
