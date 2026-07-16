## Overview
Facet is a cooperative, phone-native riff on *Concept* and *So Clover* for 3-5 players. A secret answer is split into distinct property-fragments; each cluer privately sees only one fragment and never the whole word, then everyone drags icons onto a shared canvas to build a group cipher the guesser must read.

## Problem
Most clue-giving games (*Just One*, *Concept*) have one person who knows the whole answer — a solo performance while everyone waits — and a single passed phone destroys any hidden information. We want every cluer simultaneously active and genuinely blind to the whole, which is only possible if each phone holds a different secret.

## How it works
One Guesser (rotates); the rest are Cluers. The server picks an answer — say **VAMPIRE** — with pre-authored distinct **properties**: "drinks blood", "sleeps by day", "wears a cape". Each Cluer's phone privately shows **only one** property — not the answer, not anyone else's fragment. The host TV shows a fixed ~30-icon emoji palette plus a blank shared canvas. Each Cluer privately drags up to 3 icons onto that canvas to express their own fragment (blood drop, bat, sun-with-slash). Placements appear on the TV as one **anonymized combined icon-cloud** — no attribution of who placed what. The Guesser, who has seen nothing private, reads the ~6-9 pooled icons and shouts guesses; Cluers cannot speak. Name the answer within 90s and the room wins.

**Private (phone):** your one property, your palette + drag controls. **Shared (TV):** the palette, the combined un-attributed canvas, timer, guess log.

The load-bearing twist: because each cluer sees a different fragment and none sees the whole, the emergent icon-cloud is a real group cipher — impossible with one passed phone, since that phone would reveal every fragment. The comedy comes from your icons blurring into everyone else's into hilarious misreads.

## Technical approach
Host tab + phone PWA + authoritative WebSocket server (PartyKit / Durable Object). Data model: `Room{answer, properties[], assignments{playerId->propertyIdx}, canvas:[{iconId, x, y, byPlayer}], guesserId, phase, timer}`. Sync: property assignments delivered privately to each owner only; canvas placements broadcast to TV + others **without** `byPlayer`. The hard part is real-time drag sync of many simultaneous placements onto one shared canvas without jitter or collisions, while strictly withholding both property assignments and placement-authorship from every client but the server. Debounced position updates; server-authoritative ordering.

## v1 scope
- 3 players (2 Cluers + 1 Guesser), one hand-authored answer with 2 properties
- 30-icon palette, one 90-second round
- Guesser taps "we got it"; host confirms. Win/lose only, no scoring

## Out of scope
- Content packs / many answers, authorship-attribution bonus round
- Leaderboards, larger palettes, rejoin, anti-collusion

## Risks & unknowns
- Two properties may be too thin; icon-only expression may be too vague to ever solve
- Authoring good property sets is real content work
- Could collapse into charades-by-emoji

## Done means
Three phones join; two Cluers each privately receive a **different** property (verified distinct, neither showing the answer); their dragged icons appear un-attributed on the TV canvas in real time; the Guesser — having seen no private state — can name the answer; and server logs confirm no client received another player's property or placement authorship.
