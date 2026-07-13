## Overview
Parallax is a 4–6 player hidden-role deduction game about eyewitness testimony. A shared TV shows nothing but a spinning silhouette; the truth lives on each phone, which shows that player's private view of a small 3D tableau. One player — the imposter — is fed a subtly-wrong view, and their honest description quietly breaks the laws of space.

## Problem
Most social deduction hands the imposter a secret goal and asks them to lie. That rewards good liars and punishes shy players. Parallax flips it: the imposter isn't lying — they're telling the truth about a false world. The itch is the delicious moment three testimonies snap together and one refuses to fit.

## How it works
The server builds one tableau: 4 colored objects (red cube, blue sphere, green cone, yellow ring) on a round table. Each player is assigned a seat at a different angle and their phone PRIVATELY renders the tableau from that seat — so everyone genuinely sees a different picture. For the imposter, one object is moved (the cone is left-of-sphere instead of right-of), rendered consistently from THEIR seat so it looks totally normal to them.

Round flow: each phone privately shows your rendered angle plus three sentence-stubs to complete ('From here, the ___ is directly behind the ___'). Players read their statements aloud in seat order. The shared screen just shows an empty overhead grid the group fills in by talking. Because seats differ, contradictions are expected noise — but the imposter's moved object produces a claim that cannot be reconciled with any consistent 3D layout. Discuss, then everyone votes on one phone. Reveal shows all raw images side by side.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Tableau { objects: [{id, color, shape, x, y}] }`, `Seat { playerId, angleDeg, tableauVariant }`, one `imposterId`. Rendering is pre-baked, not live 3D: the server picks from a small library of tableaux, each with N seat-images + one 'moved' variant per object, stored as sprites. Phone just displays its assigned PNG + text stubs. Sync is trivial (state is set once per round; only votes stream). The genuinely hard part is CONTENT: authoring tableaux where the moved-object variant is individually plausible but collectively impossible, and auto-generating the sentence-stubs so testimony actually collides. v1 hand-authors 5 tableaux.

## v1 scope
- One round, 4 players, one fixed tableau + its imposter variant
- Pre-rendered seat images (no live 3D engine)
- Read-aloud testimony, single group vote, reveal grid
- Room code join, no accounts

## Out of scope
- Live 3D rendering / arbitrary camera angles
- Scoring across rounds, imposter win-streaks
- More than one imposter

## Risks & unknowns
- Can players actually reconcile 3D testimony verbally, or does it collapse into noise? (playtest the stub wording)
- Is the moved-object contradiction findable in one round, or too subtle/too obvious?
- Authoring cost per tableau may be high

## Done means
4 phones each show a distinct rendered angle of one shared tableau, exactly one shows the moved variant, players read stubs aloud, and in blind playtests the crew fingers the imposter above chance while the imposter reports the game 'looked completely normal' to them.
