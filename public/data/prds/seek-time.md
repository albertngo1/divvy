## Overview
A tiny macOS menubar app that makes your computer audible again. It listens to real block-device I/O and synthesizes, in real time, the sound of a mechanical hard drive doing that exact work: seek clicks, head chatter during a compile, spin-up whine on wake, the lonely tick of an idle platter. Never the same twice, because your machine's I/O is never the same twice. For anyone who misses knowing what their computer was doing without looking.

## Problem
SSDs took away the single best ambient debugger ever built. You used to *hear* a runaway indexer, a swap-death spiral, a build finishing. Now the machine is a silent brick with a fan that only tells you it's hot. Existing HDD-sound emulators are retro-computing toys playing canned loops on a timer — they aren't driven by anything, so they're dead after ten seconds. The interesting version is the one where the sound is a true signal.

## How it works
- A synthesis engine models a virtual 7200 RPM drive: 16,383 cylinders, one actuator, a fixed seek-time curve (settle ≈ 1.5 ms, full stroke ≈ 12 ms).
- Every filesystem event gets mapped to a **virtual cylinder**. This is the trick: real LBAs aren't exposed, so instead take the touched file's **inode number**, rank it into the volume's inode space, and use that as the cylinder address. Files created around the same time have nearby inodes — so a `git status` sweeping one repo produces tight, fast chatter, while an app cold-starting across `/System`, `~/Library`, and a project dir produces long, satisfying full-stroke *thunks*. Locality becomes audible for free.
- Seek distance drives grain selection and pitch from a small bank of sampled click transients; IOPS drives grain density; sustained MB/s drives a low spin harmonic with a touch of wow-and-flutter.
- A 12×12 px menubar animation shows the actuator arm swinging in sync, with the pack idle-ticking when nothing is happening.

## Technical approach
- Swift + AppKit menubar app, no window.
- Throughput/IOPS source: IOKit, walking `IOBlockStorageDriver` for the `Statistics` dictionary (`Bytes (Read)`, `Operations (Write)`, `Latency Time (Read)`), polled at 60–100 Hz. Unprivileged, cheap, always available. This alone gives density and whine.
- Path/inode source (optional, opt-in): a privileged helper running `fs_usage -w -f filesys`, parsed line-by-line, `stat()`ing paths on a background queue with an LRU path→inode cache. Falls back gracefully to stats-only mode if the user declines.
- Audio: AVAudioEngine with a custom `AVAudioSourceNode` doing granular playback — 6–8 recorded click samples, per-grain pitch shift proportional to `log(|cyl_now − cyl_prev|)`, plus a sine stack at 120 Hz (7200/60) with ±0.3% drift for platter whine. Everything ducked hard so it sits under speech.
- Data structures: a ring buffer of I/O events timestamped with `mach_absolute_time`, drained by the audio thread lock-free (single-producer/single-consumer).
- Genuinely hard part: **latency honesty.** `fs_usage` is a firehose with tens of milliseconds of jitter; a click that lands 200 ms after the disk activity feels fake instantly. Requires aggressive decimation (cap at ~40 grains/sec, drop by keeping the largest-seek events in each 25 ms bucket) and a fixed small audio look-ahead so grains schedule on a stable clock rather than whenever the parser wakes up.

## v1 scope
- Stats-only mode: IOPS → click density, MB/s → whine. No `fs_usage`, no root.
- Three click samples, one whine oscillator, one master volume slider.
- Menubar icon with two states: idle, active.
- Ships as an unsigned .app you drag to /Applications.

## Out of scope
- Inode/seek mapping (that's v2, and it's the whole point — but v1 must be audible first).
- Per-app attribution, notifications, history graphs, iOS.
- Emulating specific drive models as a gimmick menu.

## Risks & unknowns
- Charm decay: this could be delightful for a day and annoying forever after. Mitigation is a *very* low default volume and an "only when on AC power" toggle.
- `fs_usage` needs root and is dropped from sandboxed/notarized distribution paths — the good mode may only ever be a build-it-yourself feature.
- IOKit statistics may be too coarse on Apple Silicon internal storage to produce interesting variation.

## Done means
Running a `git clone` of a large repo, a Spotlight reindex, and an idle desktop each produce audibly distinct, recognizable soundscapes, and a blind listener can tell "something big just happened" without looking at the screen — with under 5% CPU and no audio glitches over a one-hour run.
