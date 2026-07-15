## Overview
Bunk is a 3-5 player concurrent-room party auction for the eternal fight: who gets the good bedroom on the group trip. The host TV shows the disputed room; each phone is a private paddle holding a secret, asymmetric hand of "favor" chips.

## Problem
Sealed-bid auctions are the most elegant auction format — everyone commits at once, no turn-order slog — but in person they collapse: you scribble bids on scraps, reveal on a shaky count of three, argue about who wrote what, and everyone can see how much money everyone started with, which kills the bluff. Hand out identical money and it becomes pure arithmetic. The itch is an auction where you genuinely don't know what your opponents can bring.

## How it works
One lot: the best bedroom (host TV shows it and why it's coveted — ensuite, balcony, no shared wall). Each phone is privately dealt a DIFFERENT hand of ~6 favor-chips with odd denominations (a "3", a "7", "dishes all week = 5"). You can't see anyone else's hand, and hands don't match, so budgets are unreadable. On your phone you privately select any subset of your chips to commit, watching a running total only you see. A host countdown ticks. At zero, all bids reveal simultaneously on the TV: totals pop up, the highest wins the room, and — crucially — only the WINNER's committed chips are burned; losers keep everything. Overbidding wastes chips you'll want for the next lot.

Private per phone: your unique chip hand, your live selected subset, your secret total. Public on host: the lot, the countdown, and after reveal everyone's committed totals and the winner. Never your remaining hand.

## Technical approach
Host browser tab + phone PWAs + authoritative WS server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: Room{lotId, phase, players[]}, Player{id, name, hand:Chip[], committed:ChipId[], revealed:bool}. Server deals hands at join via seeded RNG guaranteeing distinct multisets. Phones send commit-toggle events; the server holds committed sets secret until phase flips to REVEAL at countdown-zero, then broadcasts all totals in one message. The hard part isn't throughput (state is tiny) — it's SIMULTANEITY INTEGRITY: no phone may learn another's bid before the reveal instant, and edits after zero must be rejected. The server owns the countdown clock authoritatively, freezes commits at T=0, and clients only render.

## v1 scope
- 3-4 players, one bedroom lot, one sealed round.
- Fixed pre-authored chip hands, distinct per seat.
- Simultaneous reveal; winner burns their committed chips.
- Host shows totals + winner; no persistence.

## Out of scope
- Multiple lots / full budget campaign across rooms.
- Tie-break beyond a leftmost-seat placeholder.
- Custom chip flavor, avatars, reconnection.

## Risks & unknowns
- With a single lot, "save chips for later" is theoretical; may need 2 lots to feel real.
- Asymmetric hands could read as unfair rather than tense; denominations need tuning.
- Reveal drama depends entirely on host-screen choreography.

## Done means
Three phones join, each sees a different hidden chip hand, each commits a subset blind, the host counts down, and at zero all totals reveal simultaneously — highest wins, only their chips burn, and no phone could see another's bid before the reveal.
