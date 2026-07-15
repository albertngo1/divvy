## Overview
Magic Word is a desktop toy that renders your real filesystem as the fictional `fsn` 3D file browser from Jurassic Park ("It's a Unix system, I know this!"), complete with a lurking Dennis Nedry who taunts you on every permission-denied. For anyone who wants their file manager to be gloriously impractical.

## Problem
File browsing is joyless, and the most iconic file UI in cinema is a fictional 3D flythrough nobody can actually use. Secondary itch: making a homelab's file access (a `~/media` + `~/public-src` Filebrowser stack) absurdly fun instead of a plain table of rows.

## How it works
Point it at a directory. Folders become glowing 3D pillars on a grid — height encodes size, hue encodes mtime — connected by light-cables. The camera flies between them. Click a pillar to descend with a whoosh. Hit a directory you can't read and the screen glitches: a pixel Nedry appears, wags his finger — "ah ah ah, you didn't say the magic word" — access denied. Type the configured passphrase to force your way in.

## Technical approach
Web app: Three.js front-end + a small local server (Go or Node) exposing a read-only directory-listing API backed by real `stat()` (size, mtime, mode bits). Layout is recursive grid packing per directory level; cables are Catmull-Rom curves. Nedry is an animated sprite sheet with user-supplied `.wav` clips. Permission detection comes from mode bits and `EACCES` on `readdir`. It runs as a menubar app or drops into an existing Filebrowser deployment as an alternate view. The genuinely hard part is making 3D navigation actually navigable — a breadcrumb and minimap so it's a usable toy, not a demo — plus perf on directories with thousands of entries (instanced meshes, LOD, frustum culling).

## v1 scope
- Local folder, one level deep with click-to-descend + back
- 3D pillar layout with size/mtime encoding
- Permission-denied Nedry gag on unreadable folders

## Out of scope
- Writing/deleting/moving files
- Remote mounts, search
- The full original fsn feature set
- Multiplayer

## Risks & unknowns
Audio/sprite likeness rights — ship art-free and let the user supply clips. Novelty wears off unless it stays genuinely usable. WebGL performance on very large trees.

## Done means
Open it on a directory containing a `chmod 000` subfolder, fly to it, and clicking it triggers the Nedry 'magic word' denial; readable folders descend correctly with size and time reflected in pillar height and color.
