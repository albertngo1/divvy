## Overview
Nibble steals the fishing minigame (Stardew Valley, Breath of the Wild, Dredge) and makes it a real-time, all-at-once party race. 3-5 players each hold a phone that is their own rod on one shared lake shown on the TV. Bites arrive privately and in real time; you must feel yours, set the hook, and reel it in — all while the table competes for a limited pond. For groups who want something twitchy and tactile, not word-y.

## Problem
Fishing minigames are secretly the most satisfying timing loop in games, but always solitary. The itch: a version where three people are all mid-catch at once, the good fish are contested, and you can literally feel a bite in your palm that the person next to you cannot — a private sensation as the core of a shared race.

## How it works
The TV shows a shared lake with occasional 'boils' (spots where a big fish surfaces) at specific coordinates. Each phone PRIVATELY shows your rod: drag to aim, flick-strength to set cast distance, then wait. The server schedules a bite on your line after a hidden random delay; when it fires, YOUR phone buzzes (haptic) and flashes — nobody else's does. You have a ~700ms window to flick 'set the hook,' then a reel minigame: keep an on-screen tension bar inside a moving green band by tilting the phone, or the line snaps. Land it and the fish is removed from the shared pool and scored on the TV. Contested layer: casting into an active boil = a chance at the big fish, but if two lines occupy the same zone, both tangle and lose their bite. Per-phone is load-bearing because bites are simultaneous, private, and haptic — you cannot pass one phone around to service three lines biting at once, and the private buzz is the signal.

## Technical approach
Host tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `lake { fishPool[], boils[] }`; per-player `line { castZone, state: idle|waiting|biting|reeling, tension }`. Server owns bite scheduling and tangle detection (two lines in one zone). Bite event → server sends `bite` to that one client, which fires `navigator.vibrate` + visual. Reel loop: phone streams `deviceorientation` tilt at ~20Hz; server (or client with server validation) integrates tension against the moving band and rules land/snap. Hard part: real-time per-phone timing fairness under variable phone latency, and honest tangle arbitration for near-simultaneous casts.

## v1 scope
- 3 players, one 90-second round, one lake.
- Two fish types: common (always available) + one contested boil fish.
- Haptic bite + flick-to-hook + tilt-tension reel.
- Score = total fish landed; highest wins.

## Out of scope
- Tackle/upgrades, multiple lakes, day/night, more fish species, reconnection, spectators.

## Risks & unknowns
- **iOS Safari does not support `navigator.vibrate`** — the private bite signal must gracefully fall back to a sharp audio+visual cue, which weakens the tactile pitch. Big open question.
- Could degrade into parallel solitaire if the contested boil isn't compelling enough — tangle + shared pool must bite hard.
- Tilt-reel calibration varies by phone hold; needs a quick zeroing step.

## Done means
3 phones fish one shared lake for 90 seconds; a bite privately buzzes exactly one phone, that player sets the hook and reels via tilt, and two players casting into the same boil visibly tangle and both lose it — proving simultaneous private bites and a contested shared pool, not three independent games.
