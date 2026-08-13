## Overview

A local daemon plus a monthly report for anyone with a 2,000-file note vault they no longer trust. It treats the vault as a circulating collection: every note has a circulation record, and once a year the collection is weeded using the same statistics librarians use to decide which books go to offsite storage.

## Problem

Every note-taking system optimizes for capture and search. None of them measure *use*. So the vault grows, search degrades, the graph view becomes a hairball, and you have no evidence about which notes ever earned their place. Deleting feels like vandalism, so nothing goes. Librarians solved this in 1969 and nobody in the PKM world noticed.

## How it works

1. The daemon records circulation events: note opened, note edited, note linked-to from a note you edited, note surfaced in a search you then clicked.
2. After 90 days it has a shelf-time distribution — for each note, time since last circulation.
3. Slote's method: look only at notes that *did* get reused; find the shelf-time period covering 95% of those reuses (say, 214 days). Anything past that period is statistically unlikely to ever circulate again.
4. It generates a weeding list with per-note evidence: "created 2023-04-11, opened 3 times, last circulated 2024-09-02, 0 inbound links."
5. You approve. Files move to `_annex/` with a stub left behind so links still resolve. Nothing is ever deleted — that's the whole contract.
6. Rescuing a note from the annex stamps it and resets its record.

## Technical approach

Swift/Go daemon on macOS. Event capture is the crux: `atime` is useless under relatime, and mtime is polluted by sync. Use three sources instead — (a) Spotlight `kMDItemLastUsedDate` via `NSMetadataQuery`, which macOS genuinely maintains for user-opened files, (b) an FSEvents stream on the vault for edits, (c) an optional Obsidian plugin emitting `file-open` and `active-leaf-change` to a local socket, which is the only high-fidelity signal.

Store in SQLite: `note(path, created, size, open_count, edit_count, last_circulated)`, `event(note_id, kind, ts)`, `link(src, dst)`. Link graph parsed from `[[wikilinks]]` and markdown links; inbound-link count is a second weeding axis (Trueswell 80/20 check: verify ~20% of notes account for ~80% of opens before trusting any of it).

The genuinely hard part is false circulation. A vault-wide search, a backup, or a sync client can "open" 2,000 files in a second. Needs a debouncer that discards any burst of >20 opens in 5 seconds and requires a dwell time (file stayed active ≥8s) before counting.

## v1 scope

- Watch one folder, log open + edit events to SQLite
- `report` command: table of notes sorted by shelf time, with counts
- Hardcoded 180-day weeding cut, no statistics yet
- `weed --dry-run` prints what would move

## Out of scope

Cloud sync, iOS, multi-vault, auto-summarizing weeded notes, any LLM involvement, actual deletion.

## Risks & unknowns

Burst filtering may still under- or over-count. Users may find the report accusatory. Slote's math assumes a stable collection; a vault growing 30%/year may break the shelf-time distribution.

## Done means

After 30 days of running, `report` names the 20 notes you have never once reopened, you check five of them by hand, and all five are genuinely dead.
