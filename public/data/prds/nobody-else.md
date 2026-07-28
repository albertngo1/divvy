## Overview
A 60-second room-scavenger game for 3–6 people in one physical space, played on a host TV plus phone cameras. Everyone receives the *same* prompt ("something that has been repaired", "something nobody in this room owns"). You hunt the room, frame an object, and lock it in. Points go only to objects **nobody else photographed**. The obvious answer is the worst answer.

## Problem
Scavenger and "look around you" party games reward speed. Speed converges: five people sprint to the same conspicuous thing. This game makes convergence the loss condition and turns the room into a contested resource — you can watch someone drift toward your corner and have to decide whether to abandon a perfect answer.

## How it works
One round. The TV shows the prompt and a 60s clock. Every phone shows a live camera viewfinder plus one thing the TV never shows: a **private heat bar**. While you frame something, your phone ships a tiny visual descriptor to the server twice a second; the server tells you only *how many other phones are currently pointed at something visually similar* — never who, never what. Your bar goes amber when one other person is circling your object, red at two. Nobody can see your heat but you.

So: you find the perfect toaster, the bar goes red, and you must either hold and gamble that they bail first, or run. Everyone bailing at once re-collides somewhere else. The TV shows only an anonymous room-wide congestion ring — the room *feels* the panic without being able to resolve it.

At lock-in (or 0s), each phone uploads its still. The server clusters the descriptors; any cluster of ≥2 is **void**. The TV then reveals the payoff: voided photos slammed side by side ("three of you shot the same houseplant"), then the survivors, which the room upvotes for a bonus.

## Technical approach
PartyKit / Durable Object room, one object per game code; phones are a PWA (getUserMedia + canvas). Descriptors are computed **on-device** — downscale to 64×64, build a 48-bin HSV histogram plus a 16-bin edge-orientation histogram, L2-normalize — and streamed at 2Hz over WS (~200 bytes). No video ever leaves the phone until lock.

Server state: `{players: {id, descriptor, lockedShot?}}`. Each tick it computes pairwise cosine similarity (N≤6, trivially O(N²)) and unicasts each player a single integer heat. Final clustering uses a stricter threshold plus greedy union-find.

The genuinely hard part is **threshold calibration**: the descriptor must be stable enough that two people shooting one couch collide, and loose enough that a couch and a rug don't. Expect a hand-tuned threshold plus a debug overlay during playtests. Second hard part: heat must update in <300ms or the bail-out chicken game stops feeling live.

## v1 scope
- One prompt, one 60s round, 3–6 phones, one room
- Private heat bar (0/1/2+) and lock button
- Collision reveal on TV; score = 1 for a unique shot, 0 for a collision
- Six hardcoded prompts, one drawn at random

## Out of scope
- Multi-round, ML embeddings, remote play, photo storage, the upvote bonus

## Risks & unknowns
- Descriptor may be dominated by lighting rather than object identity
- Camera permission friction on iOS PWAs
- A dim room could make everything collide with everything

## Done means
Five phones in one living room; three deliberately frame the same object and all three are voided in the reveal; each of those three saw their heat bar hit red at least 5s before lock.
