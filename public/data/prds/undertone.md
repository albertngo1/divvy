## Overview
Undertone is a 3-5 player convergence game about interpreting a vague word as a color, together, in silence. A prompt appears; everyone privately picks the color it evokes; the room wins only if all the picks quietly collapse onto one shade. It's a synesthesia argument settled without words.

## Problem
"What color is jealousy?" is a great bar argument that dies the moment someone says it out loud and anchors everyone. Existing color games are about matching a *shown* target. The itch: converge on a shared *interpretation* with no reference and no talking, where the whole tension is whether your gut-color is anyone else's gut-color. Anchoring must be impossible, which means each pick has to be genuinely private and simultaneous.

## How it works
The host TV shows one evocative word — a mood, a time, a taste ("nostalgia," "static," "low tide"). Each PHONE privately shows a full-screen color plane (hue across, lightness up/down) with a draggable puck; the phone's whole background becomes the color under the puck, visible only to that player. Nobody sees anyone else's choice. As players drag, the host shows ONLY two things: a single blended swatch (the room's average color) softly pulsing, and a "muddiness" meter — the spread of everyone's colors. Convergence turns the blob from a muddy brown-grey toward one clean, saturated shade and drains the meter.

Players silently chase the shrinking meter for ~30 seconds, nudging their puck toward where they think the room is drifting — but they can only infer that drift from the aggregate, never from a peer. Win when the maximum pairwise color distance drops below a threshold and holds for 2 seconds. Reveal shows every player's actual swatch in a row plus the consensus color exported as a shareable chip with the word.

PRIVATE per phone: your color and puck position. SHARED on host: only the average swatch + muddiness meter, then the final reveal. Individual colors never leak mid-round.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `room { word, phase, players: { id, name, lab: {L,a,b} } }`. Phones convert the picked color to CIELAB and send throttled updates (~10/s). The server computes the centroid color and the max pairwise ΔE (perceptual distance), and broadcasts ONLY the centroid + a normalized muddiness value — never individual colors. Genuinely hard part: a convergence meter that reflects true perceptual spread (ΔE2000, not naive RGB) and updates smoothly across clients without leaking anyone's position, plus a hold-timer that debounces jitter so the room doesn't flicker across the win line.

## v1 scope
- One hardcoded prompt word
- 3 players, one ~30-second round
- Hue/lightness plane picker at fixed saturation
- Server computes centroid + max ΔE; muddiness meter + hold-to-win
- Reveal row + consensus chip (no export yet)

## Out of scope
- Word decks, multiple rounds, scoring
- PNG export / sharing
- Full 3D color control (saturation axis)
- Any per-player color visibility mid-round

## Risks & unknowns
- Some words may have no room consensus (unwinnable) or an obvious one (boring)
- Screen color calibration varies across phones — the same LAB may look different
- Meter could feel opaque; players may not learn to read the aggregate

## Done means
Three phones join, a word appears, each privately drags a color no one else can see, the host shows a live blended swatch and muddiness meter, and the room hits a held win when all three colors converge — with individual colors revealed only at the end.
