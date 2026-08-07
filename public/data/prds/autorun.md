## Overview
Autorun is a headless crawler for *interactive software* instead of websites. Point it at a 1990s CD-ROM (a world atlas, a plant encyclopedia, a phone directory, a museum's interactive kiosk disc), and it boots the disc in an emulator, systematically clicks through every reachable screen, reads the text off the framebuffer, and emits a structured dataset plus a navigable state graph. For archivists, data hoarders, and anyone who wants the 1998 numbers that never made it onto the web.

## Problem
An enormous amount of curated, expensive-to-produce reference data exists only inside dead executables: population tables, species keys, local business listings, medical references, regional maps. Internet Archive preserves the *disc image*, so you can run it — but the data is still locked behind a mouse and a 640×480 screen. Nobody can query it, join it, or diff it against today. Manual transcription is the only current option, and nobody does it.

## How it works
1. Mount the ISO in an emulator (DOSBox-X for DOS, QEMU + a Win98 image for 32-bit titles) with a VNC display.
2. A crawler loop: screenshot → detect clickable regions → click → screenshot → diff. Each distinct screen becomes a node keyed by a perceptual hash of its stable regions; each click is an edge. The VM snapshot (`qemu savevm`) is the back button that dead software doesn't have — the crawler restores rather than trying to navigate backwards.
3. Text extraction does *not* use general OCR. 90s UIs use fixed bitmap fonts, so Autorun segments connected components, clusters them, and asks you to label ~80 unique glyphs once. After that, text decoding is exact and free forever for that title.
4. A VLM pass runs only on *screen types*, not every screen: given one example, it labels the layout ("this is a country stats panel; population is the number right of the 'Pop.' label") and writes a small extraction rule that then runs deterministically on all 190 sibling screens.

## Technical approach
Python. `vncdotool` for input, Pillow + NumPy for framebuffer diffing, `imagehash` for state identity, scikit-learn DBSCAN for the glyph atlas, Claude (vision) for one-shot layout labeling with a JSON schema output. Data model: `screens(hash, png, parent, click)` and `extractions(screen_hash, rule_id, fields)` in SQLite. The genuinely hard part is *frontier management*: knowing when you've seen every screen, escaping modal dialogs and video cutscenes, and detecting screens that differ only by content (same layout, different country) so you don't re-run the VLM 190 times.

## v1 scope
- One title, hardcoded: a single world-atlas disc from the Internet Archive.
- One screen type: the per-country statistics panel.
- Manual list of the 190 click targets — no autonomous exploration yet.
- Output: `countries_1998.csv` and a diff table against the World Bank API today.

## Out of scope
Audio/video assets, protected/encrypted discs, non-Latin bitmap fonts, anything that needs a real 3D accelerator.

## Risks & unknowns
Emulator input timing flakiness; titles with animated backgrounds that break perceptual hashing; copyright on the extracted data (facts aren't, layouts might be); some discs stream text from readable files, making the whole crawl unnecessary — check first.

## Done means
Running `autorun atlas.iso --profile encarta98` unattended produces a CSV with ≥180 countries whose population values match a hand-checked sample of 20 screens exactly.
