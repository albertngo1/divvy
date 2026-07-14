## Overview
Long Count is a concurrent-room party game about internal clocks. Everyone's phone is a single glowing button; the host TV is nearly black. The room's only job is to independently produce the *same duration* — to silently agree on how long "a while" is — without ever seeing each other's timing. For 3–6 friends who like the eerie fun of discovering their guts are (or aren't) in sync.

## Problem
Most synchrony games give you a shared external signal to lock onto — a beat, a color, a heat gauge. Convergence becomes reactive copying. The unscratched itch is *matching each other with no shared reference at all* — pure Schelling on subjective time, where the only tool you have is your own sense of duration.

## How it works
Host calls the round. On a shared "GO" (host countdown flash), every phone's button becomes live. **Privately, each phone:** shows only its own softly brightening glow while you hold the button, and darkens when you release. You hold for as long as you *feel* is right and let go once. You see no timer, no number, and nothing about anyone else. There is no target duration — you are trying to match the length of the others' holds, whatever those turn out to be.

**The host screen shows** only a spinner ("waiting on 2 more…") until everyone has released. Then it reveals all holds as horizontal bars stacked on one timeline, and computes a convergence score = 1 − (spread / mean), spread being the standard deviation of durations. Tight clustering = the room lit up green and "IN SYNC"; a scatter earns a groan. Best-of-three, but v1 is one reveal.

The per-phone privacy is load-bearing: if you saw a live bar of anyone else's hold, you'd just copy it and the game evaporates. The whole tension is committing to your own internal count while blind.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Room{phase, players[], goTimestampServer}`; `Player{id, holdStartMs, holdEndMs}`. Sync strategy: the server stamps a single authoritative `GO`; each phone measures its *own* hold with `performance.now()` (fully local, jitter-free), then sends `{duration}` on release. Convergence is computed server-side once all durations arrive — no real-time streaming needed, which sidesteps the usual hard part. The genuinely hard part is honesty of measurement: guard against clock drift by using each phone's local monotonic clock for the interval itself and only using the server clock to gate the round start.

## v1 scope
- 3 players, one round, one hold each.
- Single big button; local `performance.now()` timing.
- Host reveal: stacked bars + one convergence number + green/red.
- Join via room-code QR on host screen.

## Out of scope
- Multiple rounds, scoring across rounds, leaderboards.
- Any live feedback during the hold.
- Target durations or difficulty tiers.

## Risks & unknowns
- Is blind duration-matching *fun* or just frustrating? Needs playtest; the reveal has to feel like a shared reveal-of-selves, not a fail screen.
- People may all default to ~1s and trivially "win" — may need a nudge ("aim long") or a subjective prompt ("as long as a held breath") to spread the natural range.

## Done means
Three phones, one host. All press GO, hold, release; host reveals three bars and a convergence score within 500ms of the last release, and the same three durations replayed produce the same score deterministically.
