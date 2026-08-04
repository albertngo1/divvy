## Overview

**Blind Bearing** turns each phone into a physical compass needle you set down and abandon. Four players answer a prompt not by typing but by placing their phone flat on the floor, top edge aimed at a real object in the room — offset by a secret quarter-turn only their phone knows. The host TV draws four needles pointing at nothing sensible, then de-rotates them for the reveal.

For 4 people in a living room who want to get up off the couch.

## Problem

"Point at the thing" games break because pointing is public — everyone sees your arm. And phone answers are typed, which makes the room a lobby, not a board. Blind Bearing makes the answer physical *and* unreadable by bystanders, so the room can debate in the open while nobody can actually see what anyone means.

## How it works

1. **Zero.** All phones face the TV, tap ZERO. This fixes a shared TV-relative bearing frame (magnetometer + a per-device offset).
2. **Prompt.** Host TV shows one prompt about the physical room: *"Which thing in here would you grab in a fire?"* Phones show the same prompt PRIVATELY plus one extra line no one else sees: `YOUR TWIST: quarter turn CLOCKWISE` (or counter-clockwise, or half turn).
3. **Aim and abandon.** Each player walks to open floor, points the phone's top edge at their chosen object, applies their twist physically (rotate the phone in-hand), and sets it flat on the floor. While held, the phone shows a live heading dial. The instant the accelerometer reads flat (|gravity_z| > 9.4) and still for 2s, the phone **locks**: heading is committed, the screen blanks to a black SET card. No corrections, no re-reading your twist, no seeing your own answer again.
4. **Talk.** 45s of open discussion while people place. You may say anything — but everyone's needle is twisted by an unknown amount, so watching a rival's phone tells you almost nothing.
5. **Reveal.** Host TV draws a top-down room diagram with four raw needles (nonsense). Then, one at a time, it un-twists each needle and names the nearest object from a short list the group tagged at setup.
6. **Score.** 3 points if your object matches **exactly one** other player. 0 for solo, 0 for a three-or-more pileup. So the game is: negotiate a secret pair out loud, in front of everyone, without being able to verify.

## Technical approach

Host browser tab + phone PWAs + Socket.IO server over Tailscale Serve.

- **Setup step:** the host walks the room once and the group taps 6 object names into the host screen with a rough bearing each (aim the host laptop? no — one designated phone tags them by pointing and tapping). Those 6 bearings are the answer key.
- **Data model:** `{room: {objects: [{name, bearingDeg}]}, players: [{id, twistDeg, committedHeadingDeg, lockedAt}]}`.
- **Phone → server, 10 Hz while unlocked:** `{heading, gravityZ, still}`. Lock detection runs server-side so a player can't fake it by covering the sensor.
- **Server → host:** raw headings only, until the reveal command flips a per-player `revealed` flag.
- **Hard part:** magnetometer accuracy on a floor near steel and speakers. Mitigation: score by nearest-object *bucket* with a ±25° tolerance and mark ambiguous placements as CONTESTED rather than guessing. Secondary hard part: reliable flat-and-still detection that doesn't fire while someone is crouching.

## v1 scope

- 4 players, one prompt, one round.
- 6 room objects tagged by one phone at setup.
- Three possible twists: +90°, −90°, 180°.
- Host screen: raw needles, then reveal, then a 4-row score list.

## Out of scope

Multiple rounds, prompt packs, distance (bearing only), re-tagging objects mid-game, spectators, phone pickup after lock.

## Risks & unknowns

- Applying a mental quarter-turn may be too fiddly; fallback is a phone animation that shows the rotation to mimic.
- Small rooms compress objects into overlapping bearings — needs a minimum 30° separation check at tagging time.
- People may not want to put their phone on the floor. A table works identically.

## Done means

Four phones zero at the TV, each locks and blanks within 2s of being set flat, the host draws four twisted needles that read as noise, the un-twist reveal names a plausible object for each player, and a deliberately-paired duo scores 3 while a solo scores 0.
