## Overview
Tenured is an idle desktop toy fed by the live garbage collector of a real JVM process you're running. It renders allocation and survival as a little ecosystem: eden pond, survivor tanks, and a walled "old estate" whose residents have nameplates listing where they were born. It's for backend developers who'd rather glance at an aquarium than read a GC log — and who will, roughly by accident, catch a leak.

## Problem
GC behavior is one of the most dynamic, dramatic things happening inside a running program and it is exposed exclusively as walls of log text nobody reads. Meanwhile leak detection is a thing you only do *after* the pager goes off, in a heap dump, in a bad mood. There's no ambient, glanceable, emotionally sticky representation of "objects that should have died and didn't."

## How it works
Point Tenured at a JVM. Sampled allocations spawn critters in the eden pond — species by class (`byte[]` is a fat slug, `String` a minnow, your own domain classes get generated sprites), size by bytes. When a young collection fires, a wave washes across the pond and nearly everything dissolves. Survivors swim into the survivor tank wearing an age badge (`age 1`, `age 2`, …). Each subsequent collection they survive, the badge increments. At `MaxTenuringThreshold` they're promoted through a little gate into the **old estate**, where they get a brass nameplate showing their allocation stack frame.

The toy layer is the idle-game accretion: the estate slowly fills, species diversify, you get a menubar count. The dangerous usefulness is that a healthy service has a churning pond and a nearly static estate — while a leak looks exactly like one species buying up all the property, with one allocation site on every nameplate. Click a resident to copy its stack trace; a rising-slope alert can fire an ntfy push.

## Technical approach
A sidecar Java process consumes JFR event streams via `jdk.jfr.consumer.RecordingStream` (JDK 14+) against a target started with `-XX:StartFlightRecording=settings=profile`. Events used:
- `jdk.ObjectAllocationSample` — sampled allocations with class + stack trace + `weight` (bytes represented); this drives spawning, with weight → sprite size and a scaling factor so the pond stays under ~500 sprites
- `jdk.YoungGarbageCollection` / `jdk.GCPhasePause` — the wave events
- `jdk.TenuringDistribution` (or `-Xlog:gc+age=trace` parsing as fallback) — the per-age survivor byte histogram, which is the ground truth for how many critters advance a badge
- `jdk.OldObjectSample` — JFR's own leak-candidate sampler; these become the *named* tenured residents

The sidecar pushes newline-delimited JSON over a localhost WebSocket to a PixiJS canvas in a Tauri shell (menubar item + popover window). Data model: `Critter{id, species, bytes, age, birthStack, state}` in a flat typed-array pool; state transitions are driven by GC events, not by the renderer's clock.

**Hard part:** JFR gives you a *sample*, not a census. Reconciling a sampled allocation stream and an aggregate age histogram into a single honest population — deciding which on-screen critters die when the histogram says 60% of age-2 bytes survived — requires a weighted resampling scheme that doesn't lie about the shape while staying visually stable.

## v1 scope
- One JVM, connection string hardcoded
- Browser tab, not a menubar app
- Three species (byte[], String, everything-else), no generated sprites
- Eden + estate only; skip survivor tanks and age badges
- Nameplates show class name only, not stack

## Out of scope
Python `gc`/Go equivalents, multi-process, remote JVMs over JMX, actually fixing anything, historical replay.

## Risks & unknowns
Sampling bias could make the toy quietly misleading. Legitimate caches look identical to leaks — the alert will need a "grant tenure permanently" ignore-list or it cries wolf. `settings=profile` has non-trivial overhead on hot services. Go/Python ports need entirely different backends since neither has real tenuring.

## Done means
Run a demo app that leaks (`static List` appended in a loop) alongside a clean one. Within three minutes the leaky app's estate visibly fills with a single species and every nameplate names the same allocation site; the clean app's estate stays flat while its pond churns continuously. A screenshot of the two side by side is self-explanatory to someone who has never read a GC log.
