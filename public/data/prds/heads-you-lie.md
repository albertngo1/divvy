## Overview

A 4–6 player parlor game that ends not in a winner but in a printed artifact: **"Census of This Room, [date]"** — five true-ish statements about the people present, with nobody's individual answer knowable. It is built on randomized response, the real 1965 survey technique for asking humans embarrassing questions. For groups who want the spicy-question genre without anyone getting cornered.

## Problem

Every "deep questions" party game collapses the same way: the honest answer is socially expensive, so people either lie flat or dodge, and the game produces nothing. The itch is wanting to know something true about your friends *as a group* while giving every individual airtight deniability — and having something to keep afterward.

## How it works

Host TV reads one yes/no question aloud: *"Have you cried in the last month?"*

Each phone **privately** shows the question plus the result of a per-player, per-question weighted coin the server flipped:

- **TRUTH (p=0.75):** both YES and NO buttons are live. Answer honestly.
- **FORCED (p=0.25):** a second hidden flip picks an answer; your phone enables **only that button**. You cannot deviate. "The coin is answering for you."

The TV never shows individual answers — only a raw tally and the de-biased readout, phrased as a band, never a count: with observed yes-rate ŷ, π = (ŷ − 0.125)/0.75, rendered as *"somewhere between 2 and 4 of you."* The fuzziness **is** the anonymity, and it's honest about small-n noise instead of hiding it.

Because a quarter of the room was compelled, any given YES is deniable — which is exactly what makes people answer the other three-quarters honestly.

After five questions the host renders a poster and shows a QR code. Optionally, any phone may tap **Sign it** — a purely voluntary button that adds your name to the poster's footer. Nobody is asked who said what.

## Technical approach

Host browser tab + phone PWAs + one Cloudflare Durable Object per room (or Socket.IO over Tailscale Serve).

**Data model:** `Room{code, players[], qIndex, phase}`, `Flip{playerId, qIndex, mode, forcedAnswer}` (server-only, never broadcast), `Tally{qIndex, yes, n}`. Per-player answers are folded into `Tally` and **discarded** — the server never persists a `(playerId, answer)` pair, so a compromised host tab has nothing to leak.

**Sync:** trivial — 6 clients, one message per question. The load is social, not technical.

**The genuinely hard part is trust, not sync.** Players must believe the coin was fair and not rigged after they answered. Solution: **commit-reveal.** At room start the server generates a seed, broadcasts `SHA-256(seed)`, and derives every flip from `HMAC(seed, playerId‖qIndex)`. At the end it reveals the seed; each phone recomputes its own flips and shows a green "coins verified" check. Anonymity by protocol, verifiable by arithmetic.

## v1 scope

- Exactly 5 players, one session, five hardcoded questions
- Server-side weighted coin + button-locking on FORCED
- One TV screen: question, then band readout
- Poster PNG rendered on host canvas, QR to download
- Commit-reveal verification check on each phone

## Out of scope

Question packs, custom questions, multi-round, accusation/guessing phases, accounts, sharing beyond the QR.

## Risks & unknowns

With n=5 the estimator is genuinely noisy — mitigated by never printing a point estimate. FORCED-mode lying may feel like being robbed of a joke; needs playtest. Question tone is the whole game: too tame is boring, too sharp weaponizes the deniability. Some players will simply announce their coin aloud; that's allowed and self-correcting.

## Done means

Five phones answer five questions; at least one player is visibly FORCED and cannot press the other button; the TV shows only bands; all five phones display "coins verified" after seed reveal; the QR yields a PNG poster; and no screen in the room, at any point, displayed a named answer.
