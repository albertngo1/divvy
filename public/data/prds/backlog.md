## Overview
A 4-player, 4-minute draft where the thing that ruins real drafts — the one person who takes ninety seconds a pick while everyone stares — becomes the actual strategy. Packs move as messages, not objects. Your phone holds a private *inbox* of open packs, you can hold as many as you like, and after each pick you choose which direction to send the pack. For anyone who has ever loved drafting and hated waiting.

## Problem
Drafting is a beautiful mechanic wrapped in dead time. Packs pass in lockstep at the speed of the slowest player, so 80% of the table is idle 80% of the time, and the interesting information (what's piling up, who's starving) is invisible. In person you literally cannot hold three packs at once without it being cheating.

## How it works
The theme is absurd and legible: you're drafting cards to assemble **The Worst Possible Vacation** (a destination, a companion, a mode of transport, a thing that goes wrong). Each player needs one card of each of 4 categories.

Every pack is a set of 5 cards with a **freshness bar**. Packs enter the system at t=0; whenever a pack sits in *anyone's* inbox, it rots — after 25 seconds held, its cards start greying out one at a time and greyed cards score nothing.

**Private on each phone:** your inbox (a stack of open packs, each with its own rot bar), the full contents of every pack you hold, your drafted 4 slots, and a whisper hint like "nobody has passed you a TRANSPORT yet." You pick one card from any held pack, then tap LEFT or RIGHT to send the remainder — including choosing to send a nearly-rotted husk to the player who obviously needs it.

**Public on the TV:** four towers showing only inbox *depth* and total rot per player — no contents. A tower growing while everyone else's shrinks is the whole social event: "why is Sam sitting on four packs?"

Hoarding is real power (you see more cards, you can deny) and real cost (rot destroys the cards you were hoarding). Nobody ever waits.

## Technical approach
Host tab + phone PWAs, authoritative server (PartyKit Durable Object per room). Data model: `Pack {id, cards[], holderId, enteredHolderAtMs, rotMs}`, `Player {id, inbox: packId[], picks{}}`. Rot is **never** computed client-side as truth: the server keeps `rotMs` accumulated and stamps it on every transfer; phones render a locally-extrapolated bar from `(rotMs, serverNow)`.

The hard part is that this is a distributed mutable-object system, not turn-taking: two events can race (I pick a card at the same instant the pack's last card rots; I forward a pack while a rot tick fires). Solution: every pack is a single-owner object with a monotonic `version`; `PICK` and `FORWARD` carry the version the client saw, the server rejects stale ops and replies with a full pack snapshot, and the client optimistically renders but reconciles on reject. Rot ticks run server-side at 250ms as ordinary versioned mutations.

## v1 scope
- Exactly 4 players, **one draft**, 4 packs of 5 cards, 4 categories, ~3 minutes.
- Fixed card list of ~40 hardcoded cards, no images, text only.
- TV shows depth towers + rot, then a final reveal of each player's 4-card vacation read aloud.
- Scoring: 10 per non-rotted category filled, 0 for empty or greyed. No tiebreak.

## Out of scope
Multiple draft rounds, card synergies/combos, images or art, reconnect, custom card sets, spectator mode.

## Risks & unknowns
Biggest risk is that hoarding is strictly dominant or strictly terrible — the rot rate vs. pack count balance is untested and will need one live playtest to tune. Second: 4 players × 4 packs may be too little congestion for towers to ever look interesting. Third: reading a rotting inbox on a phone under time pressure may just feel stressful rather than fun.

## Done means
Four phones each hold a different pack at t=0, and a full 3-minute draft completes with zero blocking waits; a pack forwarded at the exact moment a rot tick lands resolves identically on all five screens (verified by replaying the server event log), and the TV's tower heights match the server's inbox lengths at every second.
