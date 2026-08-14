## Overview

`curshome` is a CLI + single-file HTML viewer that treats a raw build log as what it really is: a recording of a terminal screen over time. It ingests the unrendered log artifact from GitHub Actions / GitLab / Buildkite / a local `script`-wrapped run and gives you a scrubbable, searchable reconstruction of the screen — plus a "dead air" index that ranks the longest intervals where the screen did not change.

For: anyone who has scrolled 40,000 lines of `\r`-spam progress bars looking for the one line that mattered.

## Problem

CI captures stdout as raw bytes. Progress bars, spinners, cursor-up rewrites, and `\r` overwrites were designed for a live 24×80 screen and are meaningless as text. So a 900 KB log renders as 40k near-identical lines, the web UI truncates it, `grep` matches inside a line that was overwritten a millisecond later, and the actual question — *where did this 22-minute job spend its time, and what was on screen when it hung?* — is unanswerable without adding timestamps you forgot to add.

## How it works

1. `curshome fetch <run-url>` pulls the raw log (`gh api /repos/{o}/{r}/actions/jobs/{id}/logs`, which returns the untouched byte stream with per-line ISO timestamps GitHub already prepends).
2. A VT100/xterm state machine replays every byte into an 24×N cell grid, snapshotting the grid whenever it changes.
3. Output: an offline HTML file with a timeline strip. Band height = number of cells that changed in that tick. Long flat stretches = the build was blocked.
4. Click any point → see the exact screen. "Jump to longest stall" is one keystroke; so is "jump to last change before exit code."
5. `--asciicast` exports asciinema v2 for sharing.

## Technical approach

Rust CLI (fast on 100 MB logs) or TypeScript if I want the parser shared with the viewer; realistically start with TS + `@xterm/headless`, which is a battle-tested VT parser I do not want to rewrite. Drive it byte-by-byte, and after each chunk hash the serialized buffer (xxhash over cell contents+attrs) to detect real change vs. redraw-of-identical-content. Store snapshots as a keyframe every 200 changes plus per-tick cell deltas — a 20-minute log lands under 2 MB.

Timeline data model: `{t, changedCells, cursorRow, keyframeIdx, deltas[]}`. Stall detection is a simple run-length pass over ticks with `changedCells == 0` when timestamps exist, or `bytes==0` gaps when they don't.

Hard part: logs that interleave *multiple* concurrent writers (parallel test shards writing to one fd) produce a screen state that never existed on any real terminal. Detect via cursor-position thrash and fall back to a per-prefix split view.

## v1 scope

- `curshome < file.log > out.html`, stdin only
- xterm-headless replay, 24×120 fixed grid
- Timeline with change-magnitude bars + scrubber
- "Longest stall" jump button
- Search across *final* screen states, not raw bytes

## Out of scope

- Live streaming/attach; multi-job run overview; annotations; hosted service; non-ANSI log formats (JSON logs).

## Risks & unknowns

- Some CI providers strip ANSI before storing — then the whole premise evaporates for those users. Need to verify per provider (GitHub keeps it; check GitLab).
- Alternate screen buffer / TUI installers (like `docker buildx`'s fancy output) may reconstruct beautifully or hilariously wrong.
- Is "screen didn't change" actually correlated with "process was blocked"? Probably yes for the hang case, no for silent CPU-bound work.

## Done means

Given a real 20-minute GitHub Actions log from a Docker build, the HTML opens in under 1s, the "longest stall" button lands within 2s of the true hang (verified against the job's own step timings), and the screen shown there is legibly the same thing I'd have seen watching it live.
