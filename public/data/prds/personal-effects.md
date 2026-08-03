## Overview
A 3-player, 5-minute talking game for a room with a TV. You are heirs dividing six objects from an estate. The catch: no two of you have the same words for the same things. Claim an object nobody else claimed and you get it. Claim one someone else also claimed and it is destroyed in the move, and you both get nothing.

## Problem
Every negotiation party game assumes a shared vocabulary — everyone points at the same card and says its name. But real fights over shared things are mostly *reference failures*: "the blue one," "grandma's chair," "the thing from the hallway." We want a game where collisions come not from bad timing or hidden intentions but from the fact that you literally cannot tell whether you are talking about the same object.

## How it works
Six objects exist. Each player's phone shows all six, but under that player's own **private lexicon**, in that player's own shuffled order, with no numbers or IDs.

One object might appear as:
- Phone A: "brass floor lamp, chipped base"
- Phone B: "the tall thing from the hallway"
- Phone C: "Lot with the frayed cord"

Lexicons are authored by *category*: one player's descriptions are all material/appearance, another's are all location-in-the-house, another's are all condition/provenance. Crucially, the overlaps mislead — a second object is *also* tall, a second object is *also* brass.

**Each phone (private):** its six descriptions, plus a private point value on three of them (your sentimental attachments differ from theirs — you genuinely want different things, which is what makes cooperation possible at all). Two claim slots.

**Host TV (public):** a 90-second talk timer, six blank frames, and nothing else. No names, no images, no ground truth.

The room talks. "I want the lamp." "There's no lamp on my list." "Does anyone have something with a cord?" "Two of mine have cords." You are trying to broker a partition of a set you cannot jointly name.

At the buzzer, everyone privately locks two claims. Resolution on the TV, one object at a time: uncontested → awarded, and the winner's private description is shown to the room for the first time. Contested → the frame shatters, and the object is announced with a neutral third **auctioneer's catalogue term** ("Lot 4: table lamp, brass, damaged") — the moment where everyone finally learns what they were arguing about. Both claimants score zero on it.

## Technical approach
PartyKit / Cloudflare Durable Object per room; host tab plus phone PWAs over WebSocket. Data model: `Object {id, catalogueTerm}`, `Lexicon {playerId, objectId → description}`, `Value {playerId, objectId → points}`, `Claim {playerId, objectIds[2]}`.

Sync is trivially simple — lockstep phases (deal → talk with server-owned countdown → lock → resolve), one simultaneous reveal, no real-time contention. The engineering care goes elsewhere:

**Leak prevention.** Phones must never receive true object IDs. Each player gets per-player opaque tokens, independently shuffled, and the payload is padded so ordering and size reveal nothing; a shoulder-surfed screen or a screenshot must not let another player map descriptions to objects. Claims are sent as opaque tokens and de-anonymized only server-side at resolution.

**The genuinely hard part is authoring.** A lexicon set needs a tuned ambiguity graph: enough shared attribute vocabulary that the room can *almost* triangulate, enough decoys that they will confidently get one wrong. Bad sets are either trivially solvable in 20 seconds or pure noise where talking is pointless. v1 hand-authors two estates and playtests them; no generator.

## v1 scope
- 3 players, 6 objects, one round
- One hand-authored estate (a second as a spare)
- 90-second talk phase, 2 claims each
- Resolution animation with catalogue-term reveal on contest
- Final score = sum of your private values on objects you actually got

## Out of scope
Multiple rounds, 4+ players, trading/promises tracked by the system, generated lexicons, images of objects, any bidding or currency layer.

## Risks & unknowns
The room may solve the reference problem too fast by brute-force describing everything aloud — the 90-second timer and description length are the tuning knobs, and they may not be enough. Conversely three players over six objects may be so easy to partition that nobody ever collides; if playtesting shows that, tighten to 5 objects or add a rule that at least one object must be claimed by everyone. Value distributions must make some overlap inevitable without making the game feel scripted.

## Done means
Three phones join a room code and each sees a visibly different description set for the same six objects. A full round runs end to end, and in playtesting with three people who have not seen the lexicons, at least one object is destroyed by a genuine referent mix-up — both claimants believing they had agreed to take different things — with the catalogue-term reveal landing as the punchline on the host TV.
