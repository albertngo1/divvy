## Overview
Fallow is a live desktop wallpaper that inverts productivity software: it rewards you for *not* touching your computer. A little procedurally generated ecosystem sprouts, grows, and blooms only during periods when you're idle. The longer you stay away, the more elaborate it gets — and your idle streaks are ranked on a global leaderboard. For the Wallpaper Engine crowd and anyone charmed by doing nothing well.

## Problem
Wallpaper Engine is a top-played 'game' that's pure passive consumption — millions watch pretty loops that do nothing and mean nothing. Meanwhile every other app nags you to be more active. Nothing turns your desktop's *ambient state* into a quiet competition, and nobody has made idleness itself the score.

## How it works
A background agent watches OS input-idle time. While you're active, growth pauses and the scene stays sparse. Cross an idle threshold and plants germinate; sustained idle unlocks flowers, insects, weather. Touch the mouse and growth freezes (nothing dies — it's gentle). Each idle session is a 'fallow streak'; the app posts your longest daily and all-time streaks to a leaderboard, with a global map of anonymized gardens. Mischief: the world literally flourishes because you walked away from the screen.

## Technical approach
Electron or a Tauri app rendering a WebGL canvas as the wallpaper (macOS: a borderless window pinned to the desktop layer; Windows: SetParent to WorkerW). Idle detection via OS APIs (`CGEventSourceSecondsSinceLastEventType` on macOS, `GetLastInputInfo` on Windows). The garden is an L-system + simple cellular-automata growth model seeded per user, advanced by accumulated idle-seconds so growth is deterministic and resumable. A tiny serverless endpoint (Cloudflare Worker + KV) stores streaks and serves the leaderboard. Hard part: correct, low-power idle detection across sleep/lock/multi-monitor, and making growth legible when you glance back after minutes.

## v1 scope
- macOS only, single-monitor wallpaper window
- L-system plants that grow with accumulated idle time
- Local streak tracking + one global 'longest streak today' leaderboard
- Freeze-on-activity, resume-on-idle

## Out of scope
- Windows/Linux, multi-monitor
- Social features beyond a single leaderboard, accounts
- Weather/insects/seasonal systems

## Risks & unknowns
- Leaderboard is trivially spoofable (just don't use your computer / fake idle); needs light plausibility checks.
- Wallpaper-layer hacks are OS-fragile and break across updates.

## Done means
On a Mac, leaving the machine idle visibly grows the garden, returning freezes it, and a multi-minute streak appears on the global leaderboard.
