## Overview
A 4-player deduction game about hedging. One photograph, four private versions of it. Everyone's phone renders the image less blurred than the shared TV, but one randomly chosen phone renders it noticeably less blurred than the other three. Nobody is told their blur level. The privileged player must guess vaguely enough to blend in — while still being scored on how right their guess is.

## Problem
Imposters in social deduction almost always know *less* than the group and bluff upward. The inverse — someone who accidentally knows too much and must perform confusion — is a much better acting problem, and it's a feeling everyone recognizes: the meeting where you realize you're the only one who read the doc.

## How it works
Host TV (public): the photo at heavy blur, the phase, the timer, and later everyone's submitted words side by side, attributed by name.

Each phone (private): the same photo, blurred at that player's assigned level, and nothing else identifying. Three phones get σ_group; one gets σ_odd (meaningfully sharper). No phone ever shows a slider, a level, or a comparison.

Flow:
1. **One word** (30s). Each player privately types a single word describing the photo. The TV reveals all four at once, attributed.
2. **Talk** (75s). Open discussion out loud. This is where the sharp player over-specifies — *"it's a market"* lands very differently next to three people saying *"orange"*.
3. **Guess** (30s). Each phone privately submits a short final guess of what the photo actually is. This is scored, which is the whole tension: the sharp player is punished for hedging.
4. **Vote** (20s). Each phone privately names who they think saw it clearest.
5. **Reveal.** TV shows the unblurred photo, each player's blur level, each guess, the votes.

Scoring (v1): sharp player +3 if not majority-voted; every player +2 for a correct guess; every player +1 for a correct vote.

## Technical approach
PartyKit Durable Object (or Socket.IO over Tailscale Serve). State: `{code, phase, imageId, levelByPlayer{}, words{}, guesses{}, votes{}}`. Sync is trivial — four short submissions and three phase transitions.

The hard part is that the obvious implementation destroys the game. Shipping the full-resolution JPEG and applying `filter: blur()` in CSS means the sharp image is already on every device; any player can defeat it with devtools or a screenshot. So blur is **pre-rendered server-side**: each pack image exists at two levels, baked at build time, and served through a per-player opaque signed URL (hash keyed to room + player + level) with no level in the path. A client cannot construct or fetch a level it wasn't assigned.

The second hard part is perceptual: a fixed σ in image pixels is not equal blur across a 5.4" phone and a 6.9" one. We normalize σ against rendered CSS width and clamp the render to a fixed device-independent display width, then accept that DPR differences add noise.

## v1 scope
- Exactly 4 players, one round, one photo
- 8 hardcoded images, each pre-rendered at exactly two blur levels plus the sharp original for reveal
- One word phase, one guess phase, one vote phase, one reveal
- Guess correctness judged by the host tapping ✓/✗ per player — no matching logic
- Join by room code; no accounts, no reconnect, no scores across rounds

## Out of scope
More than two blur levels, graded per-player blur, image uploads, automated answer matching, multiple rounds, anti-screenshot measures beyond not shipping the asset.

## Risks & unknowns
The entire game lives or dies on one constant — the gap between σ_group and σ_odd. Too wide and the sharp player instantly knows and plays a different, worse game; too narrow and it's indistinguishable from someone just being good at blurry photos. That constant is playtest-tuned and we don't know it yet. Image choice matters as much: photos with one dominant recognizable object fail (everyone gets it), photos with none fail (nobody gets it). We need images that resolve *right around* the gap. Pinch-zoom on a phone can sharpen perceived detail slightly; we disable it, but can't stop a determined cheat.

## Done means
Four phones join and play a full round to reveal. Network inspection on a non-sharp phone shows it received only its own blur level and cannot fetch another. All four private renders display at visually matched size across at least two different phone models. In 5 playtests, the sharp player is majority-identified in roughly 2–3 of them — if it's 0 or 5, the constant is wrong and v1 is not done.
