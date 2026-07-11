## Overview
Test Pit is a terminal tool (TUI) that reframes your filesystem as an archaeological site. It renders a vertical cross-section of a directory tree stratified by last-modified time, and lets you 'excavate' downward through the years, uncovering forgotten project folders as artifacts and letting an LLM write dry excavation notes about the 'cultures' that built them. It's for developers with a decade of cruft on disk — part cleanup aid, part comedy.

## Problem
Everyone has a `~/code`, `~/Downloads`, and `~/Desktop` that are geological in the worst way: layers of half-finished projects nobody remembers. Disk-usage tools (`ncdu`, DaisyDisk) show *size* but not *story*. There's no delightful way to reckon with what you actually left behind, so the cruft just sits there accruing.

## How it works
You point it at a root (`testpit ~/code`). It walks the tree, buckets every file into a stratum by mtime year, and draws a color-banded cross-section — recent = topsoil, old = bedrock. You press ↓ to 'dig' into a stratum: it surfaces the largest/most-cohesive clusters (project folders) as 'artifacts', each with a carbon-date (mtime), a potsherd count (file count), and a one-line LLM-written field note: e.g. *'The node_modules people — a prolific but wasteful culture; each dwelling contained ~40,000 identical clay tablets.'* You can tag artifacts keep / rebury (archive to tar) / discard, exporting a stratigraphy report.

## Technical approach
Go or Rust for the fast filesystem walk; Bubble Tea (Go) for the TUI. Data model: a `Stratum{year, byteTotal, clusters[]}` and `Artifact{path, mtime, fileCount, byteTotal, signature}`. Clustering: group by top-level folder under root, then score cohesion via a Jaccard signature over file extensions (a folder that's 95% `.js` + `package.json` fingerprints as a Node dig; 80% `.ipynb` as a data-science dig). Dating uses mtime with an optional git-log fallback for real 'first/last occupation' dates. The LLM notes are a single offline batch call (Claude via the API) fed each artifact's ext-histogram, size, and folder name — cache to disk so it never re-queries. The genuinely hard part is making the stratigraphy *read* as a believable cross-section when file sizes span nine orders of magnitude — needs a log-scaled, area-normalized band layout, not a naive stacked bar.

## v1 scope
- Walk one root, bucket by mtime year, draw a static ASCII cross-section
- ↓/↑ to select a stratum and list its top 10 artifacts with dates + counts
- LLM field-note per artifact (batched, cached to `~/.testpit/notes.json`)
- Export a markdown 'dig report'

## Out of scope
- Actual deletion/archiving automation (v1 just tags)
- Multi-disk / networked volumes
- A GUI

## Risks & unknowns
mtime is unreliable (backups/rsync reset it) — may need a git-date heuristic to feel accurate. LLM notes could get repetitive across many similar folders; needs prompt variety by index. The 'cross-section' metaphor may be more charming as an idea than as ASCII — a quick paper prototype de-risks it.

## Done means
Running `testpit ~/code` on a 10-year-old directory draws a banded cross-section, and drilling into the 2019 stratum surfaces at least one real forgotten project with a plausible, funny one-line field note in under 5 seconds (LLM notes cached).
