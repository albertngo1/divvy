## Overview
A 3-player cooperative voice scramble in the Devils & the Details lineage. The host TV displays a single dreary claims form; the room must fill every field correctly before a 90-second timer expires. The catch that makes it a *game*: the phone that can TYPE a field is never the phone that KNOWS its value. Filling anything requires asking out loud and someone else answering.

## Problem
Form-filling is the most boring thing imaginable — which is exactly why turning it into a contended, verbal, real-time panic is funny. The itch is the deliberate mismatch between authority (who may submit) and knowledge (who holds the data), forcing constant cross-table negotiation instead of heads-down solo work.

## How it works
The host shows a **6-field form**: Name, Account No., Date of Incident, Plate, Claim Amount, Signature. Each cell is green (filled) or empty — never marked right or wrong.

Each phone privately shows two things: (1) a **panel of 2 fields it OWNS** — editable inputs only this phone can submit; (2) a **reference sheet** listing the correct values for 2 fields it does NOT own. Ownership and knowledge are disjoint by construction: your Account No. field is blank and you have no idea what goes in it, but someone else's reference sheet holds it. So you must call out "What's the account number?" and whoever holds it reads it aloud; you type and submit.

Because everyone needs answers simultaneously, the table erupts into overlapping requests — the comedy and the coordination pressure both come from managing that verbal traffic under the clock. A shared **clerk token** means only one field submits at a time server-side, so two people hammering submit queue up and see a brief "WINDOW BUSY" — mild contention that rewards turn-taking. Win: all 6 fields submitted with correct values before 0:00.

Private per phone: your owned inputs, your reference sheet. Shared on TV: filled/empty state, timer, clerk token. One passed-around phone destroys it — the entire mechanic is that knowledge and authority live in different hands across the room.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve. Data model: `Form{fields[6]{value, ownerId, filled}}`, `Player{ownedFieldIds[2], referenceEntries[2]}`, `Room{clerkToken, timerEndsAt}`. Sync: field submits are authoritative and idempotent; server validates the submitted string against the canonical value (case/space-normalized) and broadcasts filled-state only, never correctness. The genuinely hard part is generating field assignments guaranteeing a solvable disjoint bipartite mapping (every field's data sits on a non-owner's sheet, no orphans) and arbitrating the single clerk token fairly under latency so submissions don't silently drop.

## v1 scope
- 3 players, one form, 6 fields, 90-second timer.
- One hard-coded scenario with a pre-baked valid ownership/knowledge split.
- Green/empty field indicators; no correctness hints.
- Clerk-token single-submit serialization with "WINDOW BUSY".
- Win/lose screen showing which fields ended wrong.

## Out of scope
Decoy/duplicate data values, multiple forms or rounds, 4+ players, fuzzy answer matching, reconnection, difficulty scaling.

## Risks & unknowns
Exact-string matching of spoken-then-typed values may cause frustrating near-miss failures — normalization rules need care. The clerk token might feel like artificial friction rather than fun; may cut it for a free-for-all submit. Verbal chaos could tip from funny into unresolvable with soft-spoken groups.

## Done means
3 phones join, each sees 2 owned blank fields plus a reference sheet covering others' fields, the group can verbally relay every value and fill the form, submissions serialize through the clerk token without loss, and the room reaches a correct-or-not win screen when the timer ends or all 6 are correct.
