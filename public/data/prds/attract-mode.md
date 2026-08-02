## Overview
A macOS idle-screen toy for people with a RetroArch library and a graveyard of save states. When the machine goes idle it picks the run you abandoned most guiltily, loads that state, and deterministically replays your own recorded inputs from the final minutes you played. You watch yourself lose Norfair again. Press any key and you are playing, live, from that frame.

## Problem
Save states rot silently. You have forty of them, each a paused moment of intent from months or years ago, and none of them will ever be opened because opening them requires deciding to. Meanwhile your screensaver shows drifting photos you didn't choose. This makes idle time do something both haunting and useful.

## How it works
A background indexer watches `~/Documents/RetroArch/states` and the input replay directory, plus the playlist `.lpl` JSON for real game names and libretro-thumbnails for boxart. Each run gets an abandonment score: hours invested × days since last touched. On idle, it picks weighted-randomly from the top of that list, launches RetroArch fullscreen with the state loaded and the matching replay file, and plays it back at 1× with audio muted by default. A thin HUD line sits along the bottom: *Super Metroid — Norfair — abandoned 412 days ago — 6h 14m invested.* The replay ends where you ended, which is nearly always a death or a quit mid-corridor. Fade, pick another. On keypress the replay detaches and hands you live control from the current frame, and the session records a fresh input log — so tomorrow's screensaver is today's failure.

## Technical approach
Swift menubar agent + shell orchestration. Idle detection via `IORegistry` `HIDIdleTime` rather than a real `.saver` bundle — ScreenSaverView sandboxing plus spawning a subprocess is a fight not worth having in v1, so this ships as a borderless fullscreen window on a `NSWindow` at `.screenSaver` level, dismissed on any HID event. Playback uses RetroArch's own deterministic movie system (`.bsv` / newer `.replay`), which reproduces exactly given identical core version, ROM, and starting state — the replay header carries a core identifier, so on mismatch the toy degrades to a slow Ken Burns pan over the state's embedded screenshot instead of desyncing into garbage. Index in SQLite: `(rom_hash, core, state_path, replay_path, last_played, total_seconds, thumb_url)`. Playtime comes from RetroArch's own per-content logs where available, otherwise from state file mtime clustering. Hard part is honestly the desync fallback and getting RetroArch to launch into a specific state fast enough that the transition doesn't look like a crash.

## v1 scope
- One core (snes9x), one directory scan
- No replay: just load the state, hold the paused frame, slow zoom
- Idle trigger at 5 minutes, dismiss on any key
- HUD line with game name and days since touched

## Out of scope
ROM or BIOS management, non-RetroArch emulators, cloud sync, sharing clips, Windows/Linux, netplay.

## Risks & unknowns
Replay determinism breaks across core updates — needs the fallback to be good enough that most users never notice. Audio during idle is obnoxious; muted default may make it feel dead. Only works for people who already use RetroArch, which is a small but intensely correct audience. Strictly user-supplied ROMs; nothing is bundled or distributed.

## Done means
Leave the Mac untouched for five minutes and it wakes into a game you stopped playing last year, replays your final ninety seconds including the death, and a single keypress puts you in control on that exact frame with no reload.
