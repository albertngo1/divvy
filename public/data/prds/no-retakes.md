## Overview

**No Retakes** is a 15-minute party ritual for 4–6 people in one room that produces exactly one artifact: a single group photograph, printed or AirDropped to everyone, with the secret instructions listed on the back. There is no score. The photo is the whole point, and it is taken once.

One spare phone (or a laptop webcam) is the camera on a stand or shelf. Every other phone is a private controller. Each player receives one secret staging rule that can only be satisfied by reading the room — and the shutter fires whether or not anyone is ready.

## Problem

Group photos are dead time. Someone counts to three, everyone does the same face, and the picture is deleted in a week. Meanwhile the party games that *are* fun produce nothing you keep. The itch: make the act of taking one photo into a two-minute negotiation, and make the resulting image genuinely worth keeping because it encodes a puzzle only the people in it can read.

## How it works

1. Host tab opens on the TV, shows a room code and a live camera preview from the camera device. Players join on their phones.
2. Each phone privately draws one **staging rule** from a deck. Rules are relational and reference hidden state: *"Be touching exactly one other person."* *"Be looking at whoever is looking at you."* *"Be the only person whose hands are not visible."* *"Be further from the camera than everyone else."* *"Be mid-motion."* *"Do not be in the front row."* Some rules are mutually unsatisfiable on purpose.
3. A **90-second staging clock** runs. Talking is allowed; *stating or reading your rule aloud is not*. Phones show only your own rule, a countdown, and a big red **HELD** toggle — pressing it privately signals "I am not ready." The TV shows only the count of held phones, never who.
4. At zero the shutter fires. One frame. The TV shows the photo full-screen for ten seconds of silence.
5. **Reading.** Each phone now privately guesses, for each other player, whether they satisfied their rule (yes/no) — before any rule is spoken. Then the TV reveals all rules one at a time and the room argues from the photograph alone. Majority vote per rule decides satisfied/failed.
6. **The keepsake.** The host renders a printable card: the photo on the front, the rules and their verdicts on the back, ordered so the rule list does not identify who held which. Everyone gets the file.

Private per phone: your rule, your HELD state, your reading guesses. Shared: the preview, the clock, the held-count, the one photo.

## Technical approach

Host browser tab + phone PWAs + one authoritative room server (PartyKit / Cloudflare Durable Object; Socket.IO over Tailscale Serve for a LAN party). Data model: `Room {code, phase, deadlineTs, cameraClientId}`, `Player {id, name, ruleId, held, guesses{}}`, `Rule {id, text, needsRelation}`, `Shot {blobKey, takenAtTs}`. The Durable Object is the only writer; clients send intents (`join`, `toggleHold`, `submitGuess`) and receive filtered state — a player's socket never receives another player's `ruleId` until the reveal phase, so the secret cannot be scraped from the wire.

The camera device is just another client with a `camera` capability: it streams low-res preview frames (WebRTC to the host tab, or 4 fps JPEG over the socket, which is plenty) and holds a full-res `getUserMedia` track. The genuinely hard part is **shutter determinism** — everyone must believe the frame was taken at the announced instant. Solution: the server broadcasts `shutterAt` as an absolute timestamp ~2s ahead, clients run a two-round NTP-style offset estimate against the server, and the camera captures locally at its corrected local time rather than on socket arrival. The countdown on the TV is driven by the same corrected clock, so the visible zero and the captured frame agree.

Second hard part: the full-res upload. Capture to a canvas, JPEG-encode, PUT to R2 with a presigned URL, broadcast the key. Show the preview frame as an instant placeholder so the reveal never stalls.

## v1 scope

- One round. One photo. 4–5 players plus one camera device.
- 12 hand-written staging rules, hard-coded in a JSON file.
- Camera = a laptop webcam in the host tab. No separate camera phone.
- HELD toggle and held-count only; no penalty for holding.
- Reveal phase reads rules aloud from the TV; verdicts are a show-of-hands, not tracked in software.
- Keepsake = a client-side canvas render (photo + rule list) with a Download button.

## Out of scope

Multiple rounds, rule difficulty tiers, automatic pose verification by a vision model, printing integrations, per-player photo delivery by SMS, faces/identity detection, scoring of any kind.

## Risks & unknowns

- Relational rules may be too hard to read off one still frame, collapsing the reveal into shrugging. Mitigation: skew v1 rules toward visually adjudicable ones (touching, position, gaze direction).
- Webcam quality in a dim living room. A 1080p laptop cam at ISO-hell may make the keepsake ugly; test in real party lighting before adding anything else.
- Rules that reference gaze ("look at whoever is looking at you") can be genuinely unresolvable. That may be the funniest outcome or the most deflating one — needs one live playtest to know.
- Consent: a photo is not an undo-able artifact. The host tab must show a plain "this takes and stores one photo" notice at room creation.

## Done means

Five people in a living room join from their own phones, each sees a different rule nobody else can see, the countdown reaches zero, exactly one frame is captured within 150 ms of the announced instant on every device's clock, the photo appears on the TV, all five rules are revealed, and every player leaves with the same PNG — photo on top, rules underneath — that they did not need the app to enjoy afterwards.
