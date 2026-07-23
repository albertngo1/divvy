## Overview
Duty Free is a 3–4 player bluffing game riffing on *Sheriff of Nottingham*. Each round one player is the **Customs Officer**; the others are smugglers crossing the border. Every smuggler privately packs a bag of goods, declares a (possibly lying) manifest out loud on the TV, and then sweats while the officer decides whom to search — all while sliding private bribes the rest of the room never sees.

## Problem
The joy of Sheriff of Nottingham is the *simultaneous private commitment*: everyone loads a sealed bag at once, knowing its true contents while broadcasting a plausible lie, and then negotiates bribes under the table. Around a real table, packing is sequential-ish and bribes are semi-public whispers. On phones, packing is genuinely simultaneous and secret, and a bribe is a true private DM the officer alone can read. A single passed phone cannot hold three secret bags at once or route hidden side-payments — the per-phone privacy is the mechanic.

## How it works
The host TV shows the border crossing: each smuggler's **public declaration** ("3 crates of apples"), their coin totals, and a running feed of who got searched and what happened. It never shows true bag contents or bribe offers.

Each smuggler's **phone shows privately**: their inventory of goods (legal: apples/bread; contraband: pepper/silk, worth more), a bag they fill by tapping up to 4 items, and a declaration field where they type a *legal* manifest of a single good type. They commit simultaneously. Then a private **bribe panel** lets each smuggler push the officer a secret coin offer — visible only on the officer's phone.

The **officer's phone shows privately**: every smuggler's public declaration plus the incoming secret bribe offers, with Inspect / Wave-Through buttons per bag. On Inspect: if the bag matches the declaration, the officer pays the smuggler a penalty (harassment fee); if it contained contraband or excess, the goods are confiscated and the smuggler pays a fine. Waved-through bags deliver their true contents for full value. Bribes can be pocketed whether or not the officer honors them — betrayal is legal.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `players[]` with `coins`, `inventory`, per-round `bag: itemId[]` (server-held, secret), `declaration`, and `bribes: {from, to, amount}`. Phases: `pack` (barrier — all smugglers commit before reveal), `bribe`, `judge`, `settle`. Sync is phase-gated and low-frequency; the hard part is **strict server-side secrecy**: bag contents leak to no client until settlement, and each bribe is delivered to exactly one recipient. The state push is per-client redacted, like a poker server.

## v1 scope
- 3 players: 1 fixed Customs Officer + 2 smugglers, one crossing.
- 4 goods total (2 legal, 2 contraband), 4-slot bags.
- One bribe offer per smuggler; officer inspects, waves, or takes bribes.
- Settlement tallies coins and shows a winner.

## Out of scope
- Rotating the officer role across rounds; multi-round campaigns.
- Counter-bribes, alliances, market/price fluctuation.
- Reconnection, spectators.

## Risks & unknowns
- With only 2 smugglers the officer's read may be too easy — 4 players likely the real minimum for tension.
- Balancing fine vs. harassment fee so bluffing is +EV but risky.
- Bribe UX must feel sneaky, not like a form submission.

## Done means
Two phones each pack a secret bag and declare simultaneously; the TV shows only the public declarations; each smuggler can send the officer a bribe that appears on no other screen; the officer inspects or waves each bag; settlement reveals true contents on the TV and updates coin totals to a winner.
