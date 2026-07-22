## Overview
Escrow is a menubar clipboard manager built around one fix: making CUT transactional. Today's front-page 'Ghost Cut' complaint is that cut-then-interrupted loses data because cut and copy share one volatile slot. Escrow gives cut its own visible, uncommitted holding state. For developers and heavy keyboard users who move things around all day.

## Problem
Every OS overloads one clipboard register for both copy and cut, and cut is destructive-on-paste with zero visible pending state. You Ctrl-X a paragraph, get distracted, Ctrl-C a URL, and the paragraph is gone with no signal it ever left. The clipboard's mental model is a mailbox but its behavior is a single overwritable variable.

## How it works
Cut routes into a distinct 'escrow tray' — a small always-on-top strip showing each cut item as a chip with a pulsing 'in transit / uncommitted' badge and its source app/time. A normal copy does NOT overwrite an escrowed cut; both coexist. Pasting an escrow chip 'commits' it (fades the badge); the source deletion only conceptually 'settles' on commit, so an abandoned cut is recoverable from the tray, not lost. Ring history holds the last N of both kinds. Optional: a tiny self-hosted relay syncs the tray across your machines over your tailnet.

## Technical approach
Tauri (Rust core + web UI) for cross-platform menubar + global hotkeys. Intercept cut/copy via platform clipboard APIs (NSPasteboard changeCount polling on macOS; win32 clipboard listener on Windows). Data model: a small SQLite ring of entries tagged {kind: cut|copy, committed: bool, source_app, ts, preview, blob}. Because you can't truly intercept an app's internal delete-on-cut, Escrow's honest scope is the *clipboard payload*: it guarantees the cut *content* is never lost and stays retrievable even after subsequent copies — the deletion in the source app is the user's, but the text is always recoverable from the tray. Optional sync = a tiny axum server over Tailscale with last-write-wins per entry.

## v1 scope
- Menubar app; separate visible tray for cut vs copy
- Cut payload survives subsequent copies (the core Ghost Cut fix)
- Click/hotkey a tray chip to paste; ring history of last 20
- Local only, one OS (macOS first)

## Out of scope
- Cross-device sync (phase 2)
- Rich content (images, files) beyond text/RTF in v1
- Deep app integration to make source-deletion truly reversible

## Risks & unknowns
- macOS pasteboard has no cut/copy distinction natively — inferring 'this was a cut' may require heuristics or a modifier-key hotkey users opt into
- Yet-another-clipboard-manager fatigue; the transactional angle must be immediately obvious
- Polling changeCount vs battery/perf tradeoffs

## Done means
On macOS: cut text, then copy unrelated text three times, then open the tray and paste the original cut content back intact — demonstrating the payload was never lost, with cut and copy shown as visually distinct entries.
