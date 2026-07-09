## Overview
Blowdown grafts the oddly-satisfying loop of **PowerWash Simulator** onto the deeply unsatisfying chore of reclaiming disk on a homelab. You point a pressure-washer nozzle at a 3D model of your rack and blast away crud — each glob of grime is a real reclaimable artifact (a dangling Docker image, a `.tmp` orphan, a merged-but-undeleted git branch, a stalled qBittorrent partial). Grime cleared = bytes actually freed. For self-hosters (like Albert's mac-mini stack) who know they *should* run cleanup but never do. Name is the boiler term: a steam **blowdown** purges accumulated sludge.

## Problem
Disk cleanup is invisible, scary, and joyless — `docker system prune` feels like defusing a bomb, and `du` output is a wall of text. There's no feedback loop that makes reclamation *feel* good, so junk accumulates until Jellyfin chokes. The satisfaction that PowerWash Simulator manufactures from cleaning is exactly the missing ingredient.

## How it works
A local agent scans your machine and buckets reclaimable stuff: dangling/untagged Docker images and stopped containers (`docker system df -v`), large stale files under configured roots (`du`, mtime), merged local git branches, package caches, and (optionally) stalled torrent partials. Each item becomes a patch of animated grime on a low-poly 3D scene (a stylized server tower / homelab shelf), sized by bytes. You hold-drag the nozzle; sustained spray on a patch dissolves it AND stages the corresponding real command. Nothing is deleted until you pull a big satisfying 'BLOWDOWN' lever, which shows a diff of exactly what will run. A live gauge ticks up freed GB; 100% clean = a gleaming surface + a throughput chime. Weekly, it regenerates grime from a fresh scan.

## Technical approach
Stack: Three.js front-end + a tiny local Go or Node daemon exposing a JSON scan/dry-run/apply API over localhost. Scan sources are real CLIs parsed to structured JSON: `docker system df --format`, `du -x --max-depth`, `git for-each-ref` + merge-base checks, qBittorrent Web API. Grime placement maps each artifact to a UV region via a stable hash so the same junk lands in the same spot run-to-run. Spray erosion is an alpha-mask decal accumulated per-patch in a render target. The genuinely hard part is *safety*: never delete anything the user didn't explicitly blow down, present an exact preview, respect an allowlist of roots, and make destructive commands (prune, branch -D, file rm) reversible-ish (move to a trash dir with a TTL rather than hard-delete in v1).

## v1 scope
- Scan just Docker dangling images + stale files under one configured directory
- One 3D scene, one nozzle, drag-to-clean
- Dry-run preview + explicit apply lever, freed-GB gauge
- Deletes route to a `.blowdown-trash/` with 7-day TTL

## Out of scope
- Multi-host, remote agents, auth
- git/torrent sources (v2)
- Fancy physics fluid sim; VR

## Risks & unknowns
- Accidental data loss is the whole risk — trust hinges on the preview being perfectly honest
- 3D-mapping arbitrary file lists to a satisfying scene without it feeling random
- Perf on scanning huge media trees

## Done means
Running it on a real machine shows actual dangling Docker images as grime, spraying + pulling the lever frees the exact bytes shown in the preview, deleted items are recoverable from the trash dir, and nothing outside the configured roots is ever touched.
