## Overview
Redact is a 4–5 player hidden-role bluffing game for a living room. Everyone reads the same short classified 'dossier' on their own phone, but the redaction bars are placed differently for the imposter. The room's job is to reconstruct the truth by paraphrasing lines aloud — and to sniff out the one player whose blanks don't line up with everyone else's.

## Problem
Most hidden-role games hand the imposter a totally different card and hope they can improvise. That's binary — you either know the secret word or you don't. The subtler, funnier tension is when everyone is *partially* blind and the imposter is blind in the *wrong places*, so slips happen naturally instead of being manufactured.

## How it works
The host screen shows only the dossier's title, a line counter, and whose turn it is. Each **phone privately** shows the full paragraph (say 6 lines) with ~30% of words blacked out. Crewmates all receive the *identical* redaction mask. The single imposter receives a mask that differs on ~4 words: some words visible to everyone are hidden from them, and some words hidden from everyone are visible to them.

Play: the host highlights one line at a time. On your turn you must paraphrase that line *in your own words* to the room, out loud — you may not read it verbatim. Crewmates, sharing gaps, tend to fudge the same missing words the same way. The imposter either (a) confidently supplies a word nobody else can see (a slip), or (b) stumbles over a word everyone else clearly reads. After all lines are paraphrased, everyone privately votes on their phone for the imposter. Crew wins on a correct majority; imposter wins on survival.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ code, dossierId, players[], turnOrder, phase }`; server holds the canonical tokenized paragraph and per-player `mask: boolean[]`. On join, server assigns roles, generates one crew mask + one perturbed imposter mask, and pushes each phone *only its own* masked token list — the full text never leaves the server for redacted positions. Turn advance and votes are server-authoritative broadcasts. Sync is trivially easy (turn-based, tiny payloads); the genuinely hard part is *content*: authoring dossiers whose perturbed words are ambiguous enough to give the imposter cover yet load-bearing enough that a slip is catchable. That's a tuning/writing problem, solved with a small hand-curated pack.

## v1 scope
- One hand-written 6-line dossier
- Exactly 4 players, 1 imposter
- One paraphrase pass, one vote, one reveal
- Fixed turn order, no timers

## Out of scope
- Multiple rounds / scoring across games
- Procedural or LLM-generated dossiers
- Discussion timers, accusation mechanics mid-round

## Risks & unknowns
- Perturbation calibration: too obvious and the imposter is dead on arrival; too subtle and nothing ever leaks.
- Players reading verbatim instead of paraphrasing kills the tell — needs a gentle 'no reading aloud' rule and maybe a shuffled word order.

## Done means
Four phones join one room, each shows a differently-redacted paragraph, players paraphrase all six lines in turn, cast private votes, and the host reveals whether the majority caught the imposter.
