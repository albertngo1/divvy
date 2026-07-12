## Overview
Crop is a concurrent-room party game for 3-6 players about silently agreeing on *which detail matters* in a busy image. A single photo is shown on the TV; each player privately pans and zooms their own phone to frame one small part of it; the group wins when everyone's independent crop lands on the same region. It's a wordless 'we all zoomed in on the dog, not the car, right?' Schelling game for a couch and a pile of phones.

## Problem
A cluttered photo has a dozen plausible subjects. Getting a room to silently agree on *the* subject — with no pointing, no talking — is a real coordination puzzle no party game touches. Existing 'guess the group' games are about words; nothing is about converging on a *place in an image*.

## How it works
The host screen shows the full photo, a Convergence meter, and a coarse, blurred 'attention' bloom that warms where crops overlap — deliberately fuzzy so it hints 'the room is leaning lower-left' without revealing anyone's exact rectangle.

Each **phone privately** shows the same photo as an interactive viewport: pinch to zoom, drag to pan, framing whatever detail you're betting on. Your crop is yours alone; you never see anyone else's rectangle, only your own framing and the blurry shared bloom on the TV. So you read the room's drift off that bloom and silently slide your private viewport toward the emerging agreement — abandoning the interesting-but-lonely corner you started on for the subject the group is clearly circling.

Win condition: every player's crop rectangle mutually overlaps above an IoU threshold and holds for 2 seconds. The host then zooms the shared photo into the agreed region for the reveal.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: `room { photoId, crops: { playerId: {cx, cy, scale} } }` in normalized image coordinates. Phones send throttled viewport updates (~15/s); server derives each crop's bbox, computes mean pairwise IoU, and broadcasts only the scalar meter plus a downsampled, blurred overlap heat grid (e.g. 12×8 cells) — never individual rectangles. The hard part is real-time IoU over continuously moving rects at low latency *and* a heat hint that guides without leaking: solved by (a) coarse cell binning and (b) only rendering bloom where ≥2 crops already overlap, so a lone player's position stays private.

## v1 scope
- Exactly 3 players, one fixed photo, one round.
- Win = pairwise IoU over threshold held 2s, then zoom-in reveal. No timer, no score.
- Host shows meter + blurred overlap bloom only.

## Out of scope
- Photo library / rounds / difficulty, camera capture (fixed asset only).
- Scoring, 'closest crop' MVP, labels or captions.
- Fancy easing on the reveal; chat/reactions.

## Risks & unknowns
- The heat bloom risks either being uselessly vague or leaking positions; the ≥2-overlap gate and blur radius need tuning.
- A photo with two equally strong subjects deadlocks the room; asset choice is load-bearing and needs playtesting.
- Fast panning could jitter the meter; server should smooth over a short window.

## Done means
Three phones join one room, each independently pans/zooms the shared photo, the host bloom + meter update live under ~150ms, and when all three crops mutually overlap past threshold for 2s the host zooms into the agreed region and declares a win.
