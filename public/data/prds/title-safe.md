## Overview

A 4-player deduction game where the shared TV shows almost nothing and the phones show almost everything. Each phone privately displays the same detail-dense photograph — a cluttered garage, a crowded beach, a yard sale. One phone's copy is cropped 8% inward on all sides and rescaled to fill the same frame. That player is never told. The room answers questions about the photo aloud and then votes on whose eyes are lying.

## Problem

Most hidden-role games make the odd view *categorically* different: a different word, a different goal, a missing card. That's detectable in one sentence. A crop is different only in **proportion** — nothing is missing that you'd name, the edges are just gone and everything inside sits at slightly wrong coordinates. It produces disagreements that feel like ordinary human unreliability, which is exactly the fog a deduction game wants.

## How it works

1. **Study (30s).** Every phone shows the image full-bleed. The TV shows a countdown and the words "study the photo."
2. **Lockout.** Phones blank to a plain card. Nobody can re-check.
3. **Testimony (6 prompts).** The TV issues prompts in turn order, alternating between *center* prompts ("what is directly in the middle?" — everyone agrees, trust accrues) and *edge/proportion* prompts ("how far down the frame is the ladder?", "what is in the bottom-left corner?"). Players answer aloud. The cropped player will confidently name an object that is, for them, genuinely not there — and will place shared objects a fifth of a frame off.
4. **Vote.** Simultaneous private accusation. The TV then shows both crops overlaid, border ring highlighted.

**Private per phone:** your version of the photo, your vote. **Public on TV:** timer, prompts, turn order, and — only at the end — the two images.

The cropped player has a real out: if they suspect their own frame is tight, they can say so and try to describe what *should* be in the missing ring. Correct guess, they win.

## Technical approach

Host tab plus phone PWAs against a PartyKit / Durable Object room. The server deals each client an image URL with a signed crop parameter; the odd client's URL differs only in query string, and crops are rendered server-side (or via a canvas transform gated behind a server-issued token) so nobody can read their own rectangle out of devtools. State: `{photoId, cropAssignment, phase, turnIndex, votes}`.

Sync demands are low — no sub-second coordination — but three things are load-bearing: (a) **preloading**, both images must be fully decoded before the study timer starts or a slow phone gets less time and looks guilty; (b) **display normalization**, phones with different aspect ratios must letterbox to one canonical frame, or the crop is confounded by hardware; (c) **the lockout must be server-enforced**, because a player who can re-open the image mid-testimony breaks the whole premise.

## v1 scope

- Exactly 4 players, one round, one hand-picked photo.
- One fixed crop factor (8%), always inward on all sides.
- Six pre-written prompts tied to that specific photo.
- Simultaneous vote, single reveal screen.

## Out of scope

- Photo library, procedural prompt generation, difficulty tuning.
- Multiple rounds or cumulative scoring.
- Rotations, mirrors, color shifts, or any crop other than 8% inward.
- Zoom/pan gestures on the phone image.

## Risks & unknowns

- 8% may be far too subtle (nobody notices, the vote is random) or far too obvious (prompt 1 exposes it). The single most important playtest variable.
- Photo choice does enormous work — edge detail must be nameable, and the center must be unambiguous.
- Phone screen size variance may leak the crop by physical feel rather than content.
- People are bad at describing proportion aloud, which could make *everyone* sound like the odd one.

## Done means

Four phones join, study a photo, sit through six prompts, and vote — and across three blind playtests the cropped player is identified more often than chance but less than always, with at least one round where the room accuses the wrong person and the reveal gets a groan.
