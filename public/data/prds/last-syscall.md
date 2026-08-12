## Overview

`lastsyscall` is a tiny CLI that answers one question: *is this thing hung, and on what?* Wrap any command (`lastsyscall make -j8`) or attach to a running PID (`lastsyscall -p 4412`). Whenever output goes quiet, it prints a single live line naming the deepest descendant process, the syscall it is parked in, and — crucially — the resolved identity of the file descriptor it is parked on. For anyone who has ever stared at a silent terminal deciding whether to Ctrl-C.

## Problem

A silent process is the most common and least diagnosable state in daily development. `strace` requires knowing the PID, floods you with noise, and shows the syscall *number* not what it means. `lsof` shows fds but not which one is blocking. Activity Monitor says "Not Responding" and nothing else. So the ritual is: wait, guess, Ctrl-C, rerun, guess again. The information needed already exists in the kernel; nothing surfaces it in a human sentence.

## How it works

1. Spawn the child in its own process group (or attach to a PID).
2. Watch stdout/stderr. After `--quiet-after` (default 5s) with no bytes, start sampling at 2 Hz.
3. Each sample: walk the process tree, and for every thread read the current syscall and the descriptor it names.
4. Resolve that descriptor to something human: a path, a pipe with its peer process, or a socket with reverse-DNS on the remote address.
5. Render one rewriting status line, plus a delta: bytes read/written by the tree since the stall began (zero bytes = truly stuck; moving bytes = just slow).
6. On exit, print a stall timeline: `0:05 waiting on lock /var/lib/apt/lists · 0:47 read TCP github.com:443 · 1:22 exited 0`.

## Technical approach

Rust, zero daemons. Linux: `/proc/<pid>/task/<tid>/syscall` gives syscall number plus the six argument registers — arg0 is the fd for read/write/recvfrom/flock/futex-adjacent calls; `/proc/<pid>/wchan` names the kernel wait channel; `/proc/<pid>/fd/<n>` symlinks to `socket:[inode]`, which joins against `/proc/net/tcp{,6}` on inode to get the remote 4-tuple; `/proc/<pid>/io` gives cumulative `read_bytes`. Syscall numbers → names via a generated table per arch. macOS: no `/proc`, so use `libproc` (`proc_pidinfo(PROC_PIDLISTFDS)` + `proc_pidfdinfo` for `SOCKINFO`/`VNODEINFO`) and derive the blocking call from thread run state plus `PROC_PIDTHREADINFO`; where the exact syscall is unavailable, degrade to "blocked on network fd" rather than lying. Hard part: attributing a stall to the *right* leaf when a 40-process `make` tree has 39 idle waiters — rank by "most recently changed state" and by which thread holds an fd with nonzero recent traffic.

## v1 scope

- Linux x86_64 only
- Wrap-a-command mode only (no attach)
- read/write/recvfrom/sendto/connect/flock/wait4 recognized; everything else prints the raw name
- One status line + exit timeline

## Out of scope

Flamegraphs, userspace stacks, eBPF, tracing why a lock is held, Windows.

## Risks & unknowns

`/proc/pid/syscall` needs matching uid or `CAP_SYS_PTRACE` — sudo path must be graceful. macOS parity may end up meaningfully weaker; ship it labeled as such. Sampling a 500-process tree at 2 Hz must stay under ~1% CPU.

## Done means

Running `lastsyscall curl --limit-rate 1k https://example.com/big` prints, within 6 seconds, a line naming `read` on a socket to `example.com:443` with a nonzero byte counter; running it against `sleep 60` says `nanosleep`, not "unknown".
