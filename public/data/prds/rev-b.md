## Overview
Rev B is a one-round, 4-player hidden-role game for a shared TV plus phone controllers. The room cooperatively assembles a 12-tile production line on the TV by following a four-clause Shop Manual displayed privately on each phone. Exactly one manual is the wrong revision — one clause is subtly altered — and its holder is never told. For groups who like deduction but hate performing a lie.

## Problem
Every hidden-role game asks the imposter to lie convincingly. Lying is a performance skill: theater kids dominate, quiet players dread their turn, and the whole thing collapses into vibes-based accusation. Rev B removes lying entirely. The imposter plays with total sincerity and is genuinely baffled when the line faults. What the room is hunting is not a tell — it's a person who is *internally coherent under a wrong axiom*.

## How it works
**Shared TV:** a 12-slot line filling left to right, current turn, a FAULT lamp, a fault counter (3 faults = the build fails), and an event log — `P2 placed ▲red — FAULT`. The log never says which clause was violated.

**Each phone, privately:** your four-clause Shop Manual (e.g. *1. Never place a tile directly right of the same COLOR. 2. At most two triangles total. 3. …*), your hand of three tiles, and a SUBMIT button with a 10-second turn timer. One manual swaps COLOR→SHAPE in clause 1 — legal-looking, and it makes about a third of moves disagree.

Turns go round-robin; talking is unrestricted. The server validates against the true manual, ejects illegal tiles so the board stays legal, and counts a fault. Because faults are unattributed, a genuine brain-fart is indistinguishable from a wrong-revision move — that ambiguity is the whole game.

After 12 placements or 3 faults, every phone privately submits a vote *and* a toggle: **"I think MY manual is the wrong revision."** Scoring: +2 each for a clean build; +3 for a correct accusation; the odd-manual holder gets +6 for surviving the vote, or +4 for correctly self-identifying (never both). Reveal puts both manual revisions side by side on the TV.

## Technical approach
Host tab + phone PWAs over an authoritative WebSocket server (PartyKit / Durable Object per room). State: `{room, players[], trueManual, variantAssignment: {playerId, clauseIndex, mutation}, board[12], hands{}, faults, turnCursor, phase}`. Only the server holds `variantAssignment`; each phone receives its rendered manual text at join and nothing else.

Rules live in one shared module (`validate(board, tile, manual) → {ok, clauseIndex}`) imported by client and server. Clients render an advisory local lamp from *their own* manual — so the odd player sees a green pre-check and then a red FAULT on TV, which is the exact moment the game gets good. The server's ruling is authoritative and its `clauseIndex` is stripped before broadcast.

The hard part is authoring mutations that are *interesting* rather than instantly fatal. A mutation that fires on move one outs the player immediately; one that never fires is invisible. v1 uses a hand-tuned mutation and pre-seeded hands so simulation shows it firing on roughly move 4–7. Secondary hard part: turn timers with clean reconnect — the server owns the clock, phones render a deadline timestamp.

## v1 scope
- Exactly 4 players, one round, ~5 minutes.
- One board type (12 slots), one 4-clause manual, one mutation variant.
- Pre-seeded hands from a fixed deck; no draw mechanic.
- Vote + self-doubt toggle + reveal screen. Score printed as text.

## Out of scope
- Multiple rounds, running totals, rematch.
- Two odd manuals, or a manual that mutates mid-round.
- Audio, animation, spectator mode, rejoin-after-kick.

## Risks & unknowns
- Reading four clauses on a phone under a 10s timer may be too much load; may need three clauses and 15s.
- If innocents realize they can simply read their manuals aloud, the game solves in 30 seconds. Mitigation under test: manuals are *paraphrased differently* per player, so a read-aloud comparison is noisy rather than decisive.
- The odd player may notice within two turns and start hiding — fun, but changes scoring balance.

## Done means
Four phones join a room; each shows a manual, one of which differs by exactly one clause. Twelve placements resolve with server-authoritative faults whose clause is never leaked. In playtest, at least half of odd-manual players are *not* unanimously identified, and at least one player per session says some form of "but that's what my book says."
