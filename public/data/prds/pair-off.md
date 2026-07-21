## Overview
Pair Off is a 3-player cooperative convergence game for a party. The host screen (TV/laptop) shows six numbered concept cards; each player, on their own phone, secretly links those six cards into three pairs. The room wins only if all three players produced the *exact same* three pairings — a shared perfect matching arrived at with zero communication.

## Problem
Most "match the group" party games converge on a single answer (one word, one number, one dot). Pairing is a richer, funnier combinatorial object: you're not agreeing on *what*, you're agreeing on *how everything relates*. "Obviously the dog goes with the leash" collides gorgeously with "no, the dog goes with the cat." That friction is the fun, and it needs privacy to exist.

## How it works
The host TV shows six cards (words or tiny icons: e.g. MOON, TIDE, WOLF, CLOCK, KEY, DOOR) in a fixed public layout, purely as a shared vocabulary. **Each phone privately** renders those same six cards but in a *different scrambled position* on its own screen, so you cannot mirror a neighbor's screen geometry — you must pair by meaning. The player drags to draw three connecting lines, forming a perfect matching (every card used exactly once; the UI enforces it). They lock in.

The **host screen** shows, live, only a heat map over the 15 possible card-to-card edges: how many of the three players drew each specific pair — never who, never a full matching. So you might see MOON–TIDE glowing at 3/3 but KEY sitting cold, telling the room "someone disagrees about the keys" without saying who or what they'd prefer. Players may unlock and re-pair as many times as they want. **Win = all three locked matchings are byte-identical.** On win, the host animates all three overlaid matchings snapping together and reveals each player's final pairing.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room { cards:[6], players:{ id -> { matching: [[a,b],[c,d],[e,f]] | null, locked:bool } } }`. A matching is canonicalized server-side (sort each pair, sort the three pairs) so equality is a string compare. Sync: phone sends `setMatching`/`lock`; server recomputes the 15-edge heat histogram and broadcasts it plus a `win` when all three canonical matchings equal and all locked. The genuinely hard part is *aggregation privacy* — the heat map must be informative enough to guide convergence yet never leak an individual's full matching (with 3 players and a 3/3 edge, that edge is unanimous, which is fine; partial edges stay ambiguous). Per-phone position scrambling is a client-only seed.

## v1 scope
- Exactly 3 players, one fixed six-card set, one round.
- Drag-to-pair UI with enforced perfect matching, lock/unlock.
- Host edge-heat map + win detection + overlay reveal.

## Out of scope
- More players / variable card counts / more pairs.
- Card decks, categories, scoring across rounds, timers.
- Accounts, reconnection polish, spectators.

## Risks & unknowns
- Six cards may be too easy or land in a stalemate loop; tune card semantic ambiguity.
- Edge-heat may over-hint; may need to hide counts until a threshold.
- Perfect-matching convergence with 3 players may be trivial — validate it actually stalls before it clicks.

## Done means
Three phones join, each drags a distinct scrambled layout into three pairs, the host shows a live 15-edge heat map revealing no one's full matching, and when all three canonical matchings match the host fires a win and overlays the reveal.
