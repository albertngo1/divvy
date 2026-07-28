## Overview
A 60-second party auction for 4 players where the bidding currency is *nerve measured in seconds*. Each player holds a thumb on their phone; the lot goes to whoever holds longest; **everyone pays for the time they held**, winner or not. It replaces the most tedious ritual in tabletop gaming — the ascending auction where four people mumble "plus one" for three minutes while someone makes change — with one wordless, breath-held minute.

## Problem
Auctions are the best mechanic in board games and the worst experience at the table. They stall on turn order, they need a banker, they need change, and the interesting part (reading whether anyone else still wants it) is buried under arithmetic. All-pay auctions — the genuinely spicy variant — are almost unplayable in person because nobody wants to physically hand over money for nothing.

## How it works
One lot per round, shown on the host TV: a silly prize card ("THE LAST SLICE", "NAMING RIGHTS"). At GO, everyone presses and holds a big button on their phone.

**Private on each phone:** your purse (dealt secretly and *unequally* — 20s, 35s, or 50s of budget), your live spend ticking up in real time, a red edge when you're within 3s of bankruptcy, and a private valuation card saying what this specific lot is worth *to you* (values differ per player). Nothing else.

**Public on the TV:** the lot, the elapsed clock, and one number — **how many thumbs are still down**. Anonymous. When it drops 4→3→2 you feel the room exhale but never learn who folded, only that someone did. Lifting your thumb is instant and irreversible; the last thumb down wins, pays their held time, and everyone else pays theirs too.

The fun is that the anonymous count is the only public signal, so people fold theatrically-early to fake a small purse, or hang on past ruin because they assumed the count would drop.

## Technical approach
Host tab + phone PWAs on an authoritative Socket.IO/PartyKit room. Data model: `Room {lotId, state, startedAtServerMs}`, `Player {id, purseMs, valuation, heldMs, downAt|null, upAt|null}`. Phones send only `HOLD_START` / `HOLD_RELEASE`; the **server** timestamps everything — client clocks are never trusted, and the phone's ticking counter is a local extrapolation from a server-anchored offset (NTP-style: 5 ping exchanges at join, take min-RTT offset).

The genuinely hard part is release fairness under jitter: a 180ms mobile hiccup must not lose you an auction you won. Mitigations: a `RELEASE` carries the phone's monotonic local timestamp, server clamps it to `[lastHeartbeat, now]`; phones heartbeat every 100ms while held, and a missed heartbeat streak of 500ms auto-releases at the *last confirmed* heartbeat (so a dead phone can't hold forever, and can't steal a win). Releases within 120ms of each other are a tie — both pay, prize splits.

## v1 scope
- Exactly 4 players, exactly **one lot, one round**.
- Purses dealt from a fixed 3-value table; valuations from a fixed table.
- TV shows lot, clock, anonymous thumbs-down count, then a reveal bar of who paid what.
- No money, no rounds 2+, no lobby beyond a 4-letter room code.

## Out of scope
Multi-lot economies, persistent bankrolls, spectators, sound design, reconnect-mid-hold recovery beyond auto-release.

## Risks & unknowns
Mobile browsers may throttle timers or fire spurious `pointercancel` on scroll/notification — needs `touch-action: none` and pointer capture, and a real test on an iPhone with a notification arriving mid-hold. Also unknown: whether the anonymous count is *too* informative with only 4 players (a 4→3 drop plus a visible face may de-anonymize; may need a randomized 0–1.5s display lag).

## Done means
Four phones join a code, hold simultaneously, the TV count decrements as thumbs lift, the last holder is declared within 150ms of the second-to-last release, and every player's phone shows a spend within 100ms of the server's ledger — verified on a run where one phone is deliberately backgrounded mid-hold.
