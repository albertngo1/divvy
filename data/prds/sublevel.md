## Overview
Sublevel is an inverse idle game: a Forestiere-style underground garden that flourishes *only while your Mac is idle*. It's for people who want a gentle nudge to step away from the screen — the game rewards you for not playing it. Come back after a long walk and find new tunnels dug and mushrooms bloomed; come back after doom-scrolling and find nothing grew.

## Problem
Every idle/incremental game and productivity gadget rewards *engagement* — more taps, more uptime, more screen time. Nothing rewards the opposite. There's no toy that makes absence the resource, no satisfying artifact that grows because you left.

## How it works
The garden is a cross-section of underground caverns (à la the Forestiere Underground Gardens on HN). "Growth energy" accrues per minute of continuous system idle. Idle time digs new sublevels and matures plantings; the longer the unbroken idle stretch, the rarer what appears (deep caverns, glowing fungi, a hidden koi pond). Breaking idle — moving the mouse or typing — is "sunlight": it halts growth and, past a threshold, wilts the most delicate plants (mischief, not punishment). You never grind; you just check in, admire, and leave again. Over weeks the garden becomes a quiet record of your time away from the machine.

## Technical approach
macOS menubar app (Swift/SwiftUI, or Tauri + a shell shim). Idle detection via `CGEventSourceSecondsSinceLastEventType` / IOKit `HIDIdleTime` — no accessibility perms needed. A background tick (every ~30s) accrues growth energy proportional to idle seconds; a rarity table gates deep-cavern content behind long unbroken stretches. State is a small JSON/SQLite doc: `{cells:[{depth, plant, maturity}], lastIdleStart, totalIdleMinutes}`. Render the cross-section as layered SVG/canvas in a popover. The genuinely hard part is a growth curve that makes long absences feel *meaningfully* better than many short ones (superlinear reward for unbroken idle) without letting an always-off laptop trivially max everything — likely a soft daily cap plus streak bonuses.

## v1 scope
- Menubar popover with a 3-layer garden
- Idle timer accrues energy; one plant type matures
- "Sunlight" pauses growth on activity
- State persists across restarts

## Out of scope
- Rarity tiers / hidden content
- Wilt/decay mechanics
- Cross-device sync, sharing

## Risks & unknowns
- Rewarding an idle laptop is trivially game-able (leave it on)
- "Do nothing" may be too passive to stay engaging
- Balancing idle-vs-away (idle ≠ you left the room)

## Done means
Leave the Mac untouched for 20 minutes and the popover shows new growth that measurably advanced; wiggle the mouse and growth visibly halts — and the garden state survives a quit-and-relaunch.
