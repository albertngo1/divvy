## Overview
Pander is a 3–6 player concurrent-room theory-of-mind game riffing on *Say Anything*. A rotating Asker poses an opinion question; everyone else writes an answer to charm them, then privately wagers chips on which answer the Asker will secretly pick. It's a game about reading one specific person's taste, for friend groups who think they know each other.

## Problem
Say Anything lives on its hidden commitment: the Asker secretly picks a favorite BEFORE anyone bets, and bets are placed simultaneously. On the tabletop that means a fiddly dry-erase 'SELECT' card the Asker flips face-down and a scramble of betting tokens everyone can see each other place. Physical play leaks tells and makes hidden simultaneity nearly impossible. Phones make each commitment a genuinely sealed envelope.

## How it works
The **host TV** shows the current prompt ("What's the most overrated vacation?"), who the Asker is, and — only at reveal — the anonymized answers and the settled bet board.

Each non-Asker **phone privately**: writes a short free-text answer (simultaneous, blind — you never see others' drafts). Answers then appear anonymized on the TV. The **Asker's phone privately** shows all answers and a hidden commit: tap your secret favorite (locked, invisible to the room). Now each non-Asker's phone privately shows 2 betting chips to place on the answer tiles — you may split them, stack both, or bet on your OWN answer. Placements are hidden until reveal.

At REVEAL the TV flips the Asker's pick: the writer of the chosen answer scores, and every chip on the correct tile pays out. Private simultaneous writing + the Asker's hidden commit + hidden simultaneous betting are all load-bearing — a single passed phone would leak the Asker's pick and every wager, dissolving the bluff.

## Technical approach
Authoritative WebSocket server (PartyKit / Durable Object) over Tailscale Serve; host tab + phone PWAs. Data model: `Room{prompt, askerId, phase}`, `Answer{id, authorId, text}`, `Commit{askerPick}` (private), `Bet{playerId, tileId→chips}` (private). Phases: WRITE (simultaneous) → COMMIT (Asker only) → BET (simultaneous) → REVEAL. Sync: server withholds `askerPick` and all `Bet` objects from clients until REVEAL, broadcasting only anonymized answer tiles during BET. The hard part is **commit-reveal ordering under simultaneity** — the Asker must be locked before any bet lands, and bets must lock before the pick is exposed, or a peeker gains an edge; the server enforces phase gates and rejects late or out-of-phase writes.

## v1 scope
- 3 players: 1 Asker, 2 answerers, one prompt, one round
- Fixed Asker (no rotation), 2 chips each, hardcoded prompt list
- TV reveal + naive scoring (picked writer + correct bettors)

## Out of scope
- Asker rotation, chip economy across rounds, fuzzy answer moderation, custom prompts, spectators

## Risks & unknowns
- With only 2 answers the bet is near-binary; fun likely needs 4+ answers
- Text answers invite trolling — needs light length/profanity guards
- Reveal drama depends on tight phase gating feeling instantaneous

## Done means
Three phones each submit a blind private answer, the Asker locks a favorite no client can see, both bettors place hidden chips, and the TV reveal simultaneously exposes pick + bets with correct scoring — while a network trace of any non-Asker client shows neither the Asker's pick nor others' chips before REVEAL.
