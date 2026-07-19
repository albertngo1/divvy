## Overview
A hidden-role deduction game for 3-5 people where everyone studies the "same" busy scene on their phone and gives spatial testimony about it. One player — the *Southpaw* — holds a horizontally **mirrored** copy and doesn't know it, so every left/right claim they make is systematically inverted while every color, count, and object claim stays perfectly true.

## Problem
Most spot-the-liar games hand the imposter a single hidden fact, which they simply decline to mention. The itch: an imposter whose entire *frame of reference* is subtly wrong in a way they can't see — a tell that is systematic yet disguised — while honest players must distinguish a genuinely mirrored worldview from someone who's just bad at telling left from right.

## How it works
- 3-5 players, one scene image (e.g., a crowded park illustration).
- **Study phase:** each phone shows the scene for 30s. The Southpaw's copy is flipped horizontally (a CSS `scaleX(-1)`). Colors, objects, and counts are identical; only handedness / left-right is reversed.
- **Testimony rounds:** the TV poses a slot prompt ("Where is the red umbrella relative to the fountain?"). Each phone **privately** composes a claim via a constrained template — `[OBJECT] is [LEFT / RIGHT / ABOVE / BELOW] of [OBJECT]` — and submits.
- The TV reveals all claims *simultaneously*, attributed by name. Players argue out loud. The Southpaw's left/right claims conflict with the group; above/below and colors don't — so the tell surfaces only on horizontal-axis claims, and only when the prompt invites one.
- After 3 prompts, each phone privately votes the Southpaw. TV reveals the votes and shows both images side by side (flip revealed).
- **Southpaw's play:** once they notice the room keeps contradicting their left/right, they can start inverting their own answers to bluff-correct — but doing so on a color or vertical claim (which was never wrong) exposes them a different way.
- **Phone (private):** your possibly-mirrored image + your claim composer. **Shared TV:** the prompt, the simultaneous claim reveal, the vote.

## Technical approach
- Host tab + phone PWA clients + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve).
- Data model: `Room{code, players[], sceneId, southpawId, prompts[3]}`. Client render: if `you === southpaw`, apply `scaleX(-1)` to the image; everyone else normal. The server never sends "you are mirrored" — the client just gets a flip flag it can't distinguish from noise.
- The claim template is structured (two object dropdowns + a direction) so submissions are directly comparable and the tell is crisp rather than lost in freeform prose.
- Sync is trivial (request/response per prompt); the simultaneous reveal is a server barrier — wait for all N submissions, then broadcast. The genuinely hard part is **content design**: authoring scenes whose left/right relationships are unambiguous, and prompts that reliably surface horizontal claims without making the flip trivially obvious in round 1.

## v1 scope
- 3 players, one scene, exactly 3 prompts, one Southpaw.
- Structured claim composer (two object dropdowns + a direction).
- Single vote; reveal with side-by-side flip.

## Out of scope
- Multiple imposters, freeform text claims, scoring/streaks.
- Procedurally generated scenes or multiple images per game.
- Other transforms (rotation, crop-shift, hue).

## Risks & unknowns
- The mirror may be too catchable (Southpaw wrong on *every* L/R) — tuning prompts so only some rounds probe the horizontal axis keeps it tense.
- Players genuinely fumbling their own left/right add noise that could frame an honest player (this may actually be fun).
- A single reused image limits replay; a small scene library is eventually needed.

## Done means
Three phones join; two see the scene normally, one sees it horizontally flipped with no indication; across three prompts each phone submits a structured claim; the reveal shows the Southpaw's horizontal claims consistently inverted relative to the others while their color and vertical claims agree; the vote + side-by-side reveal screen renders both orientations correctly.
