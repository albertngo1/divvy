## Overview
Parallax is a 4–6 player hidden-role deduction game for a living-room crowd. A shared host screen frames a fiction — 'you are all witnesses to the same crime scene' — while each player's phone privately renders the *same* little 3D diorama (a cluttered desk, a shelf of odd objects). Everyone believes they see the identical scene. One player, the Skew, is secretly viewing it from a camera pose rotated a few degrees, which silently changes what occludes what.

## Problem
Most social-deduction games hand the imposter a *label* ('you are the spy') and rely on them acting shifty. The lie is performative, not perceptual. Parallax makes the deception literal and involuntary: the Skew isn't hiding a secret, they're honestly reporting a subtly wrong reality, and the fun is watching a truthful-sounding claim ('the key is left of the mug') be geometrically impossible from everyone else's angle.

## How it works
The host screen shows only the fiction, a turn timer, and the round's prompt. Each PHONE privately renders the diorama via a small WebGL scene, camera pose fixed per role: honest players share one pose, the Skew's pose is offset ~12–18°. On their turn, a player speaks one spatial claim aloud ('the red key is *behind* the blue vase'). Because of parallax, occlusion and left/right relationships differ from the Skew's viewpoint — from their angle the key is *beside* the vase, or a hidden object is visible. The Skew, who knows they're the imposter but not exactly how their view differs, must decide: report honestly (and risk a claim that clashes) or bluff toward what they guess the others see (and risk contradicting themselves). After 2–3 claims each, every phone privately submits a vote for who was Skewed; host reveals the tally and the true camera poses side by side.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object). Data model: `Room { sceneSeed, players[], skewId, cameraPoses{playerId: {yaw,pitch}}, claims[], votes{} }`. The server generates one `sceneSeed` (deterministic object layout) and per-player camera poses; each phone renders locally from seed + its own pose, so no per-frame streaming is needed — only tiny state messages. Sync strategy: turn order, timer, and vote collection are server-authoritative; rendering is client-side and static per round. The genuinely hard part is *scene authoring* — hand-tuning layouts and the skew angle so the difference is real but not obvious, and so honest players themselves sometimes disagree slightly (making the Skew plausibly deniable rather than instantly caught).

## v1 scope
- One fixed hand-built diorama, one skew angle.
- 4 players, exactly one Skew, one round.
- Spoken claims (no typing); phone is used only to view + vote.
- Flat host reveal screen showing both camera poses.

## Out of scope
- deviceorientation-controlled cameras, multiple scenes, scoring across rounds, more than one imposter, animated objects, spectator mode.

## Risks & unknowns
- Skew angle too large = instant tell; too small = nobody can deduce. Needs playtesting the sweet spot.
- Players may not phrase claims spatially enough; may need a constrained claim template ('X is [left of/behind/on] Y').
- WebGL diorama must read clearly on small screens.

## Done means
Four phones each render the seeded diorama, one from a rotated pose; players make spatial claims and privately vote; the host reveals both poses; in blind playtests the Skew is caught above chance but not every time.
