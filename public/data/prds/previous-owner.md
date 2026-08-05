## Overview
A cooperative 4–6 player game that produces one artifact: a museum-style provenance card for an object that doesn't exist. Each player privately owns one decade of the object's history and can see only their immediate predecessor's entry. The group wins if the finished card reads like a real object's paperwork. For people who like collaborative fiction but hate improv pressure.

## Problem
Collaborative-storytelling games either give everyone full visibility (so it becomes one loud person's story) or full blindness (Exquisite Corpse — funny, incoherent, immediately thrown away). Nobody keeps the output. The interesting middle — partial, staggered visibility, where you must infer the shape of a story you can only see a sliver of — needs private per-player windows, which is exactly what a passed-around phone can't do.

## How it works
The host screen shows a procedurally drawn object — a ceramic vessel, a wooden chair, a brass instrument — plus its year of manufacture. That's all anyone starts with.

**Pass 1 (simultaneous, blind).** Each phone privately receives one decade (1930s, 1950s, 1970s…) and one secret event type: `ACQUIRED`, `DAMAGED`, `REPAIRED`, `LOST`, `EXHIBITED`, `NEARLY DESTROYED`. You write 1–2 sentences: who had it, what happened. You see nobody else's decade. The host screen shows only the object accumulating visible marks — a hairline crack, a patched handle, a darkened patina — as entries land, never the text.

**Pass 2 (simultaneous, one-neighbor visibility).** The server freezes Pass 1 and hands each phone exactly one thing: the frozen entry from the decade immediately *before* theirs. Now you revise your own entry to reconcile — the object you inherited is cracked, so where did the crack go? The last player also sees nothing after them. Contradictions you can't see are the point; the ones you can see, you fix.

**Reveal.** The host screen types the full provenance chronologically, first time anyone sees it whole, over the object's final rendered state. Entries stay unsigned — permanently. The card exports as an image to every phone.

## Technical approach
PartyKit Durable Object; host browser tab + phone PWAs over WebSocket. Model: `Object{seed, year, marks[]}`, `Entry{decade, eventType, authorId, draft1, draft2}`. Decades are dealt server-side and sorted; each socket gets a **projection**, not the room state — `{myDecade, myEventType, predecessorFrozenText|null}`.

The hard part is the projection fanout and the Pass-2 freeze. Naively, reading your neighbor's draft while they're editing it creates a live cascade: they revise, your basis changes underneath you, everyone chases everyone. Fix: snapshot all of Pass 1 into an immutable `frozen` map at phase transition, and serve Pass 2 reads only from that snapshot. Writes go to `draft2` and are never visible to anyone until reveal. Second hard part: deriving the object's visual marks deterministically from event types so the drawing on the host screen and the exported image agree.

## v1 scope
- 4 players, one object, four decades
- One object type (a ceramic vessel), 3 procedural mark overlays
- Pass 1 and Pass 2, no timer, 300 char cap per entry
- Chronological reveal on host, PNG export via QR

## Out of scope
Multiple objects, more than two passes, images or audio in entries, AI-generated object art, saved gallery, spectator view, reconnect.

## Risks & unknowns
Low-energy: this is quiet writing, not a party bang — it may want candlelight rather than a party. Pass 2 may feel like homework if the predecessor's entry doesn't actually constrain you. Four decades might be too thin to feel like a life; six might exhaust a room. Unknown whether the finished card reads as evocative or as four disconnected paragraphs.

## Done means
Four phones join by code; each shows a different decade and a different event type and can see no one else's; entries submitted blind; on Pass 2 each phone shows exactly one predecessor entry (the first player shows none) and nothing else; the host screen renders the object accumulating marks; the full chronological provenance types out at reveal with no author names anywhere; the exported card image lands on all four phones.
