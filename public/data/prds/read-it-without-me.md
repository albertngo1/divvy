## Overview
A 4-player, 12-minute ceremony-shaped party game for people who already know each other. The room co-writes an anonymous letter, seals its lines to specific combinations of *devices*, and leaves with a keepsake that is genuinely unreadable unless those same people are in a room together again. Nobody wins. The letter survives, or it doesn't.

## Problem
Every "write something together" party game ends with a screenshot in a group chat that dies in a week. The artifact has no weight because nothing was risked to make it and nothing is required to open it. Meanwhile the classic keepsake mechanic — anonymous confessions — has no *game* in it, just a reveal.

## How it works
**Write (3 min).** Each phone privately draws a different prompt ("the thing you almost said tonight", "what you think this group will be doing in five years"). One line each, typed privately. Lines land on the TV unattributed, in random order, as a numbered page.

**Seal (5 min).** Every phone gets exactly three seal tokens, spent privately on any lines: **SOLO** (only my device can open it), **PAIR** (my device plus one named other), **ALL** (every device present). Seals stack — a line hit by two seals needs both. The TV shows each line with a count of locks, never who placed them or which kind. Watching someone lock a line you wrote is the whole social texture.

**Burn (3 min).** Anyone can nominate a line to be read aloud *tonight*. Every phone votes privately; a majority opens it — the TV reveals the text and the author, and then strikes it from the letter permanently. Curiosity now, artifact later, and you never learn which of your own lines were already easy to open.

**Seal ceremony.** The TV renders the surviving letter with locked lines as black bars and prints a one-page PDF to every phone. Each device keeps its key shares. A month later, the room reopens the same URL, everyone joins, and lines unlock exactly to the extent that the right people showed up.

## Technical approach
Host tab + phone PWAs on one PartyKit Durable Object. Model: `Line{id, ciphertext, authorDeviceId(encrypted), seals[]}`, `Seal{kind, placerDeviceId, targets[]}`, `Device{pubkey, label}`.

Each line gets an AES-GCM key; the key is split with a small GF(256) Shamir implementation into shares matching the composed access structure (SOLO = 1-of-1 to that device, ALL = n-of-n, stacked seals = nested wrap). Shares go to devices over the socket and live in IndexedDB keyed by a device keypair generated at first join. **The server stores ciphertext only and can never read the letter** — that guarantee is the product.

The hard part isn't sync, it's identity over time: a browser cleared on one phone silently destroys a line for everyone. v1 mitigates with a printed recovery QR per device and a blunt warning at seal time.

## v1 scope
- 4 players, 1 round, 4 prompts, 1 line each
- 3 seal tokens per phone (SOLO/PAIR/ALL)
- Burn vote: simple majority, unlimited nominations until timer
- Shares in IndexedDB + PDF with per-device recovery QR
- Reopen flow: same room code, combine shares client-side

## Out of scope
- Accounts, cloud backup, cross-device migration
- Photos or audio in the letter
- Scheduled/date-based unlocking, more than one round

## Risks & unknowns
- Ceremony may play as solemn rather than fun with the wrong group
- Lost devices make lines permanently dead — charming or infuriating, untested
- Shamir + nested wraps is easy to get subtly wrong; needs a test vector suite

## Done means
Four phones write four lines, seal them, burn one by vote, and download the same redacted PDF. Then one phone leaves the room, the others reopen the letter, and exactly the lines requiring the absent device stay black — verified with the server logs showing it never held a decryption key.
