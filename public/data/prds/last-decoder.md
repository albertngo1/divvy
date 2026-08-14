## Overview
A local CLI + static HTML report that walks a directory of old files (photo archives, scanned PDFs, family video, decommissioned project folders) and rates each format on two axes nobody combines: **can it still be read**, and **is reading it dangerous**. For anyone holding a hard drive of things from before 2010.

## Problem
Format-obsolescence tools exist for institutional archivists (DROID, Archivematica) and they report format IDs, not consequences. Nobody tells you the thing that actually matters: that your 4,000 raw files from a 2006 camera are decodable only by one abandoned library with a last commit in 2017 and four heap-overflow CVEs, and that opening them in a preview pane is the exact shape of a real exploit chain. Preservation risk and parser attack surface are the same list, read in two directions.

## How it works
Run `lastdecoder ~/Archive`. It identifies formats by signature, not extension, then joins each format to a curated decoder map and produces a shelf: a horizontal chart of your archive by byte count, banded from **Safe** (multiple maintained decoders, in-OS support) through **Single Point of Failure** (one library, still maintained) to **Orphaned** (last decoder unmaintained ≥3 years). Each band expands into files, and each format card names the decoder, its last release date, its open CVE count, and one concrete action: "transcode to X", "keep a copy of the decoder binary", or "open only in a sandbox." A `--quarantine` flag writes a manifest of files that should never be double-clicked casually. The mischief is that the report is often most alarming about files the OS still previews happily, because the preview path *is* the orphaned parser.

## Technical approach
Go CLI wrapping `siegfried` for PRONOM-based format identification (returns PUIDs like `fmt/353`, `x-fmt/392`) — signature-based so a mislabeled `.dat` still resolves. A hand-curated YAML maps PUID → decoder implementation(s) (`libopenjp2`, `libavcodec/rmdec.c`, `dcraw`, `libmspack`, macOS ImageIO, …); ~150 entries covers the overwhelming majority of consumer archives. Maintenance signal comes from the ecosyste.ms API and GitHub REST (last release, last commit, open issue ratio, archived flag); vulnerability signal from the OSV.dev API queried by package name and ecosystem. Local decodability is probed empirically, not assumed: shell out to `ffmpeg -decoders`, `sips`, and `qlmanage -p` on macOS to record what this machine can actually open today, and diff that against what the format needs. Data model is `file → puid → format → [decoder] → {maintenance_score, cve_count, locally_supported}`. Report is a single self-contained HTML file with an embedded JSON blob. The hard part is the PUID→decoder mapping — it's genuinely manual curation and it's the whole product; the rest is plumbing.

## v1 scope
- macOS, one directory, no recursion limits
- 40 mapped formats (raw camera, early video, legacy office, old archives)
- Three risk bands, one HTML report
- No transcoding, just recommendations

## Out of scope
Actually converting files, cloud storage scanning, Linux/Windows probes, watching a folder over time.

## Risks & unknowns
The decoder map goes stale unless maintained; CVE counts overstate risk for libraries that are simply well-audited; may be too alarming to be useful without careful copy.

## Done means
Pointed at a real 500GB archive it identifies at least one orphaned format the owner didn't know they depended on, names the specific library, and the owner can still open a sample file after following the report's advice.
