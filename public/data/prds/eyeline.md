## Overview
A cooperative aiming relay for 3–5 players standing spread around a room. The host TV holds a shared 'token'; players advance it by making eye-contact-style mutual compass locks. Each phone is a private compass that knows only *your* next recipient.

## Problem
Pointing games usually aim at fixed objects and are solitary — one phone can do it. The itch: make the *pass itself* require two live phones agreeing in real space, with a hidden hand-off order so the group has to read each other's body language, not a screen.

## How it works
Players scatter to walls/corners. The host TV shows the token at 'position 1' and a chain of anonymized dots. **Privately, each phone shows only:** an instruction like 'PASS TO → the player by the window' (a secret, per-player next-recipient) OR 'RECEIVE — someone's aiming at you, aim back!', plus a live 'lock' meter. You physically turn and point your phone at your target person. **The shared TV shows:** the token's current holder and progress, never the chain. A pass completes when two phones' compass headings are ~180° apart (i.e., genuinely pointing at each other) and both confirm with a light shake within a 1.5s window. On success the token jumps to the receiver, who now reads *their* private next-recipient. Complete the full hidden chain before the timer to win. Wrong-target aims simply never lock, so the group must silently negotiate sightlines — turning your body, catching who's staring at you.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (Socket.IO over Tailscale Serve). **Data model:** room `{holderId, chain[] (server-only), timer}`; player `{id, heading, nextId (private), confirmed}`. Phones stream `deviceorientation` alpha (compass heading) at ~15Hz after a 'face the TV to zero' calibration to normalize drift. **Sync strategy:** the server holds the secret chain and only tells each phone its own `nextId` as a human label ('by the window'). A pass validates when `|heading_A + 180 − heading_B| < tolerance` AND both are the intended pair AND both shook within the window. **Genuinely hard part:** the server has headings but *not real positions*, so 'aiming at each other' is inferred purely from antiparallel headings — vulnerable to false positives when two unrelated players happen to line up. Mitigations: require the private pairing to match (both must be each other's expected partner isn't needed — only the passer's target must match the receiver), a shake co-confirm, and generous 'face the TV' calibration.

## v1 scope
- 3 players, one fixed 3-link chain, one 60s round.
- Compass heading + 'face TV to zero' calibration.
- Antiparallel-within-tolerance + double shake to confirm a pass.
- TV shows only holder + progress bar.

## Out of scope
- True positional triangulation.
- Competitive teams, branching chains, scoring.
- Camera/mic.

## Risks & unknowns
- Compass drift and hard-iron interference near TVs/metal (calibration helps, imperfect).
- Antiparallel false locks in small rooms — needs playtest tolerance tuning.
- Whether the 'who's aiming at me' read is legible enough without on-TV hints.

## Done means
Three calibrated phones each show only their private next-recipient; two players physically pointing at each other and shaking completes a pass within 1.5s, advances the token on the TV, and finishing the hidden 3-link chain triggers a win.
