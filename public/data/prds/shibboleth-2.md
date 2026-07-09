## Overview
Shibboleth is a cooperative secret-making game for 3–5 people. The group co-creates a passphrase from privately-held ingredients, memorizes it together, and then each person must recall it simultaneously to 'seal' it. There is no score. The prize is intangible-but-real: a shared secret only your group holds, plus a generated wax-sealed 'charter card' (names, date, a short fingerprint) — a keepsake of a secret you can never see printed again.

## Problem
Party games reward the loudest performer and leave nothing behind. The itch: a cooperative game whose reward is an *inside thing* — an actual shared secret your group built and now carries, and a small artifact commemorating that you did it, without ever exposing the secret itself.

## How it works
**Phase 1 — Assemble.** Each phone is privately dealt 2–3 'ingredients' — evocative words (later: gestures, numbers) that ONLY that player sees. The host shows empty numbered slots, one per player. The group talks openly and each player contributes exactly one private ingredient to build an ordered passphrase (e.g. PLUM → knock-knock → velvet). Out loud, they invent a shared mnemonic.

**Phase 2 — Seal.** The host hides the passphrase entirely. Every phone SIMULTANEOUSLY and privately must reconstruct and type the full sequence from memory, order-sensitive. No phone displays the answer; players may whisper and coach, but everyone must enter it themselves inside a countdown window. Sealing succeeds only if ALL phones submit correctly. On success the host renders the charter card; the passphrase is never displayed again.

Private (phone): your ingredients (P1) + your recall entry (P2). Shared (host): the slot skeleton, then the sealed charter. This is load-bearing — private asymmetric ingredients force teaching and combination, and simultaneous private recall means a single passed phone would trivially defeat the memory test.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Data model: `room {members, ingredients:{playerId:[tokens] private}, passphrase:[{playerId, token}], phase, seal:{submissions:{playerId}}}`. The server deals each player only their own ingredients, collects passphrase-building ops, then in Seal phase collects submissions and compares them server-side against the canonical passphrase.

The hard part is fair simultaneous submission *without leaking the answer*: the server holds the canonical secret and never echoes it to any client after Phase 1, runs a `serverTime`-synced countdown, and normalizes for latency so no phone's window is unfairly short. It must also handle 'one player wrong' gracefully (one retry).

## v1 scope
- 3 players, each dealt 2 word-ingredients (skip gestures/numbers)
- Passphrase = 3 tokens, one contributed per player
- One seal attempt, 20-second synced window
- Charter card = simple host-rendered image: names + date + short hash

## Out of scope
- Gesture/number ingredients, retries beyond one, multiple rounds
- Real cryptographic sealing, printing/export

## Risks & unknowns
- Memory difficulty tuning (too trivial vs. too punishing)
- Someone screenshots the passphrase in Phase 1
- Simultaneous-window fairness under variable latency
- Whether 'type the secret from memory' is tense fun or tedious

## Done means
3 phones each privately receive 2 words, the group builds a 3-token passphrase on the host, all three phones enter it correctly from memory within the window, and the host renders a charter card naming the 3 players + date — while the passphrase is never shown again after sealing.
