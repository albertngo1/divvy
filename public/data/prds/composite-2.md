## Overview
Composite is a Jackbox-shaped convergence game for 3 players in one room. Each player privately assembles a face from swappable feature parts — eyes, brows, nose, mouth, face-shape — on their phone. There is no target picture and no correct answer. The room wins only when all three faces become the *same* face. It's a police-sketch identikit turned into a silent Schelling-point exercise: what face will we all, independently, decide to draw?

## Problem
Most 'match each other' party games hand you a spectrum or a dial and let you split the difference numerically. Faces are gestalt — you can't average your way to agreement, you have to *commit* to a shared idea of a person. The itch is the eerie moment three strangers-in-a-room silently land on the same imaginary face.

## How it works
Each phone shows a **private feature-builder**: five horizontal carousels (eyes, brows, nose, mouth, face-shape), each with 6 options. You swipe each carousel to pick, watching your own face assemble live. Crucially, **each phone shuffles the option order independently** — player A's third eye-option is player B's first — so you cannot cheat by all agreeing 'everyone pick slot 1.' You must converge on the actual *feature*, not its position.

The **shared host TV** never shows any individual face. It shows one **aggregate composite**: for each of the five slots, the majority pick rendered solid, minority picks ghosted faintly behind it, plus a small **agreement ring** around that feature (full ring = all three match). No names, no per-player faces. You read the room only through which features are still 'blurry.'

Players silently swap features, watching rings fill. The room wins when all three players' full feature-vectors are identical and held for 2 continuous seconds; the host then snaps every ghost solid and reveals the three now-identical faces side by side.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model per player: `{ playerId, features: {eyes:int, brows:int, nose:int, mouth:int, shape:int}, permutation: {slot: shuffledIndexMap} }`. Phones send **canonical feature IDs** (server un-shuffles locally-picked indices), so the server compares true features, not screen positions. Server computes per-slot mode + agreement count and broadcasts only the aggregate + rings to the host at ~10Hz. The genuinely hard part is making the aggregate composite *legible and non-identifying* — ghosting minority features so the room senses disagreement without ever leaking who picked what, and rendering a live-morphing face (layered transparent PNG slots, opacity by vote count) at interactive latency.

## v1 scope
- Exactly 3 players, one round.
- 5 feature slots, 6 options each, one art set.
- Per-phone shuffled carousels; server-side canonicalization.
- Host aggregate composite + agreement rings; win = all identical for 2s.

## Out of scope
- Any target/reference face or scoring against a 'right' answer.
- Custom art, skin tones, hair, accessories.
- More than 3 players, timers, multi-round matches.

## Risks & unknowns
- Convergence could stall forever with no talking; cap at a soft 4-minute nudge that ghosts the closest-to-consensus feature brighter.
- Six options per slot may be too many (never converges) or too few (trivial) — needs playtest tuning.
- Shuffling must be truly invisible or players reverse-engineer it.

## Done means
Three phones join, each builds independently on privately-shuffled carousels, the host shows only the aggregate + rings, and when all three feature-vectors match for 2s the host reveals three identical faces and declares the room won.
