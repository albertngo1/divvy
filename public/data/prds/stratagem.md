## Overview
Stratagem is a macOS menubar app that turns homelab operations into Helldivers 2 stratagem inputs. Instead of typing `docker restart sonarr` or fumbling for a web UI, you hold a hotkey and tap an arrow-key sequence — `↑→↓↓→` — to fire a pre-registered command. It's for solo homelabbers (like a self-hoster running Sonarr/Radarr/Jellyfin/Postgres) who want fast, muscle-memory ops with built-in friction on the dangerous stuff.

## Problem
Homelab ops live in an awkward middle: too frequent to keep SSHing for, too risky to bind to a single keystroke. A one-tap 'restart Jellyfin' button is one fat-finger away from 'wipe the Postgres volume'. And web dashboards are slow to reach mid-flow. There's no fast console that scales *ceremony* to *blast radius*.

## How it works
Each command is a 'stratagem': a name, a shell command (or HTTP call), a blast-radius weight, and an arrow-code whose length is derived from that weight. Safe ops (restart a container) get a 4-tap code; nuking a volume gets a 9-tap code plus a hold-to-confirm bar, exactly like calling in a 500kg bomb. You hold ⌥-Space, the HUD overlays, you input the sequence, and a satisfying stratagem-ball 'throw' animation confirms. Miss a tap and it aborts — no partial execution. A live log tails output in the drawer.

## Technical approach
Swift + AppKit menubar app (or Tauri if cross-platform). Global hotkey via a CGEventTap; the input HUD is a borderless NSPanel with a Metal/Canvas glow. Stratagems live in `~/.stratagem/codes.toml` (name, `exec`/`http`, `weight` 1-5, optional `confirm_hold_ms`). Code length = `3 + weight`, generated deterministically from a hash of the name so muscle memory is stable across restarts. Execution shells out via `Process` with a timeout and captured stdout/stderr, or fires `URLSession` requests for *arr APIs. The genuinely hard part is a trustworthy input state machine: debouncing rapid arrow taps, distinguishing a valid prefix from a typo, and guaranteeing zero side effects on abort — plus making destructive weights impossible to under-set (lint the TOML: any command containing `rm`, `down -v`, `DROP`, `prune` forces weight ≥4).

## v1 scope
- Menubar icon + global hotkey HUD
- TOML config of ~10 stratagems, shell + HTTP types
- Auto-derived arrow codes with on-screen cheat-sheet card
- Hold-to-confirm bar for weight ≥4
- Live output drawer

## Out of scope
- Remote/multi-host orchestration
- Recording/replaying macros
- Windows/Linux ports
- Auth beyond local shell trust

## Risks & unknowns
- Global event taps need Accessibility permission and can feel invasive
- Novelty could wear off if codes are annoying to memorize (mitigate: on-screen hints)
- Shelling out arbitrary commands is a footgun; the weight-lint is the safety rail and must be conservative

## Done means
I can define a restart stratagem and a destructive one, fire the restart with a 4-tap code and see the container bounce, and the destructive one refuses to execute unless I complete its full code and hold-to-confirm — with an aborted input leaving the system untouched.
