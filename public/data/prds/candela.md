## Overview
Candela is a 3-4 player cooperative party game where each phone becomes a private light meter and the room's lighting — lamps, windows, dark corners, the TV's own glow — is the shared board. For friends who like tactile, get-up-and-move co-op over trivia.

## Problem
Party games ignore the physical light in the room, and phones' ability to sense brightness (via the camera) sits completely unused. There's a satisfying, unexploited itch in a game that makes you hunt for a specific quality of light with your body.

## How it works
The host TV shows a single photograph split into N horizontal bands, one per player, rendered badly over/under-exposed (a fogged, blown-out mess). Each phone privately shows a vertical exposure meter: a secret target band (one player needs deep shadow, one mid, one bright) plus a live reading sampled from the rear camera's average luminance. The player walks their phone around — holding it under a lamp, behind the couch, up to a window — to drive the live reading into the target band. When in-band, the phone shows a filling hold ring; a 3-second hold locks that player's image band, which snaps to correct exposure on the TV.

Crucially, ALL bands must be locked simultaneously within a window. If one player drifts out of their light zone, their band re-fogs, so the group coordinates timing out loud ("everyone hold... now"). Private per phone: your target range, your live meter, your lock state. Shared on TV: the composite photo and which bands are locked (anonymized). Nobody sees anyone else's target, so they scatter to different light zones rather than clustering.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). Camera via getUserMedia; each frame is drawn to a tiny offscreen canvas and reduced to a single mean-luminance value ~10Hz. Data model: `room { players[], image, bands: { playerId, targetRange, live, locked } }`. Phones stream luminance; the server clamps in-band, runs each band's hold timer, enforces the all-locked-simultaneously window, and broadcasts lock state; the TV maps each locked band to its correct exposure. The genuinely hard part is cross-device calibration: camera auto-exposure and white balance actively fight you, normalizing brightness so targets drift. Mitigate with a 'point your phone at the TV' calibration step that establishes each phone's bright reference, and lock camera exposure/ISO where the API permits.

## v1 scope
- 3 players, one photo, three bands: bright / mid / deep-shadow
- One round, 3-second simultaneous hold to win
- One calibration step (point at TV)
- Anonymized lock lights on host TV

## Out of scope
- Multiple rounds, scoring, leaderboards
- Image selection / uploads
- Front camera, difficulty tiers, more than 4 players

## Risks & unknowns
- Camera auto-exposure may normalize brightness enough that targets are unreachable
- Browsers throttle camera in backgrounded tabs
- Camera-on optics feel invasive (mitigate: never store frames, visible indicator, only compute mean luminance)
- Uniformly lit rooms have no shadow zone — needs at least one lamp and one dark corner

## Done means
Three phones on three real devices calibrate, each finds its distinct light zone, and all three hold their target bands for 3 seconds simultaneously to fully develop the TV photo; deliberately walking one phone out of its zone re-fogs that band.
