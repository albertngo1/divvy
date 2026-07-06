## Overview
Wheel is a 3–5 player micro-draft where each phone is a private hand of cards. It compresses the beloved-but-tedious ritual of booster drafting — pass a pack, take one card, pass again — into instant, silent, simultaneous passing. It's for card-game people who love reading a table and non-gamers who'll enjoy the light deduction.

## Problem
Physical drafting is slow and leaky: packs shuffle around the table, people wait on the slowest picker, and you can accidentally flash your hand. The magic of drafting — seeing a pack 'wheel' back to you and inferring what got taken in between — requires perfect secrecy and perfect simultaneity that human hands and a single table can't provide. Every player must privately hold a DIFFERENT pack at the same instant; you literally cannot do that with one shared screen.

## How it works
Each player is dealt a private pack of 5 cards (simple point cards: colored gems in 3 colors, plus a couple of 'set' bonus cards). Each phone PRIVATELY shows your current pack, your growing pick pile, and your SECRET scoring goal (e.g. "score for your longest run of one color" or "pairs of matching symbols"). All players simultaneously tap one card to keep; it drops into their private pile and the remaining pack is passed to the left instantly. This repeats until packs empty (5 picks). Because a shrinking pack circles the table, when your original pack wheels back you can see which cards vanished and infer what neighbors are chasing — and hate-pick to deny them.

PRIVATE per phone: your current pack, your pile, your secret goal, a live tally of your own score. SHARED on host: the pass clock, each player's pick COUNT (not contents), and, at the end, the reveal of everyone's goal + final scores.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room{code, players[], deck, passDir, pickRound}; Player{id, hand[], pile[], goalId, score}; the server owns all hands. Sync: on the round tick, each phone sends its chosen cardId; the server validates one-pick-per-player, moves the card to the pile, rotates remaining hands, and pushes each player only THEIR new hand. The hard part is the simultaneous barrier — all picks must resolve before any pack passes, or state desyncs. Use a server-side round gate: collect N picks (or a per-round timeout that auto-picks a random card for stragglers), then atomically rotate and broadcast. Never send a hand to anyone but its owner.

## v1 scope
- 3 players, one pack rotation of 5-card packs.
- 3 gem colors + 2 secret goal types.
- Auto-pick on timeout so one slow phone can't stall the room.
- End screen reveals goals and computes winner.

## Out of scope
- Multiple packs/rounds, card abilities, snake direction changes.
- Custom card sets, images, animations.
- Rejoining mid-draft, spectators.

## Risks & unknowns
- Signal-reading may be too subtle with only 3 players and one rotation; might need 4+ to feel like a real 'read'.
- Auto-pick fairness vs. stalling — timeout tuning.
- Secret goals must be simple enough to grok in 5 seconds.

## Done means
Three phones join, each privately drafts one card per round from a rotating pack they alone can see, the server enforces one pick each and passes correctly with no hand ever leaking to another player, and the end screen shows correct per-goal scores — verified by a scripted 3-player run where hand-scored piles match the host total.
