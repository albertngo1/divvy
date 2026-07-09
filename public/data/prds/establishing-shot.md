## Overview
Establishing Shot is a concurrent-room party game where every player's phone is a private viewfinder pointed at the physical space you're all sitting in. The room silently converges on a single Schelling-point object — the couch, the one weird lamp, the dog — with no talking allowed. For 3-5 people who like the delicious tension of 'we're all obviously thinking of the same thing, right?'

## Problem
Most 'match the group' games are text or menu picks — abstract and floaty. Nothing makes you look *up* at the actual room and negotiate a shared reality through a lens. And the classic version (point and shout) collapses instantly with talking. The itch: can a silent room agree on what's *obvious* using only cameras?

## How it works
Each phone opens a live camera preview (PRIVATE — only that player sees their own viewfinder) and a big 'LOCK' button. Players roam or swivel, framing whatever object they bet the room will pick. On-device, each phone runs a lightweight image classifier every ~500ms on its current frame and streams only the resulting embedding + top-k labels to the server (never the pixels).

The server clusters incoming embeddings continuously. The shared HOST SCREEN shows NONE of the frames and NONE of the labels — only: (a) a big Convergence % meter, and (b) an anonymized cluster diagram — e.g. three glowing blobs sized by how many phones currently agree ('the room is split into 2 camps'). Players read the blobs, guess which is the majority, and silently re-aim toward it. When all phones sit in one cluster above threshold for 2 continuous seconds, the room wins — and ONLY THEN does the host reveal the four near-identical captured frames side by side, the payoff.

Private-per-phone is the whole point: each device is aimed at a *different physical object in space*. One phone passed around literally cannot be pointed at three things at once, and secrecy of aim is what forces the silent guess.

## Technical approach
Host browser tab + phone PWA clients + authoritative WebSocket server (PartyKit / Cloudflare Durable Object, or Socket.IO over Tailscale Serve). On-device model: MobileNet/TF.js image embeddings computed client-side; only a 1024-float vector + top-3 labels sent per tick (~2 msgs/sec/phone). Data model: `Room { players[], phase }`, `Player { id, lastEmbedding, lastLabels, clusterId }`. Server does streaming clustering (cosine sim, threshold ~0.6, plus label-overlap tiebreak to fight angle/lighting noise) and recomputes cluster assignment + a convergence score (1 − normalized intra-room spread) every tick, broadcasting only aggregate state. The genuinely hard part: embeddings of the *same* object from different angles/lighting can drift, so matching on label-set intersection AND embedding proximity, with a forgiving threshold and a 2s hold, is what keeps it from feeling random.

## v1 scope
- 3 players, one shared physical room, one round
- Live camera + on-device embedding + LOCK button
- Host shows only Convergence % + anonymized cluster blobs
- Win = all-in-one-cluster held 2s → reveal the 3 frames
- No accounts, room code join, ~30s target

## Out of scope
- Multiple rounds / scoring across rounds
- Naming or captioning objects
- Anti-cheat on aim, cross-room play
- Fancy reveal animations

## Risks & unknowns
- Embedding reliability across angles/lighting is the make-or-break; label-overlap fallback may not be enough in dim rooms.
- Camera permission friction on iOS PWAs.
- A dull featureless room (blank walls) starves the game of options.

## Done means
Three phones join via code, each shows its own live viewfinder, the host shows a moving Convergence meter, and when all three settle on one object for 2 seconds the host reveals three photos that a bystander agrees are 'the same thing' — with zero words spoken.
