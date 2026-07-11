## Overview
Unsigned is a 3–6 player concurrent-room party game about giving anonymous compliments. Each phone is a private pen; the host screen is the mailroom. The win condition is not points — it's the personalized card of anonymous kind words each player keeps, plus the small thrill of staying unattributed.

## Problem
Party games are almost all zero-sum ribbing (Quiplash, Cards Against Humanity). There's a real appetite for a *warm* one that still has a game to it. The itch: say something genuinely nice to a friend, but disguise your voice well enough that they can't tell it was you — so the niceness stays anonymous and unearned-feeling in the best way.

## How it works
The server secretly assigns each player one target (a directed ring, so everyone writes for someone and receives from someone). Everyone writes **simultaneously** on a 90-second timer.

PRIVATE on each phone: your assigned target's name and a prompt ("one thing this person is quietly good at"), a text box, and a hidden "disguise die" — a secret style constraint only you see ("no words over 5 letters" / "write it like a fortune cookie"). You never see who is writing about *you*, nor anyone else's target.

SHARED on the host: anonymous progress ("4 of 6 sealed"), then a reveal where each recipient's note is displayed **attributed to no one**. Now a guess phase: each phone privately gets its received note and picks who it thinks wrote it. You "win" — stay anonymous — if your authored note is *not* correctly guessed. But there's no scoreboard and no elimination; the payoff is that the host compiles each player's received note(s) into a printable/downloadable card, the keepsake, and privately DMs each phone a shareable image of theirs.

## Technical approach
Host browser tab + phone PWA clients + one authoritative WebSocket room (PartyKit / Durable Object, or Socket.IO over Tailscale Serve). Data model: `Room{ id, players[], ring{playerId→targetId}, notes{authorId→{targetId, text}}, guesses{guesserId→authorGuess}, phase }`. Authorship mapping lives server-side and is never sent to clients except as the final aggregate — anonymity is enforced at the server boundary, which is exactly why per-phone is load-bearing: a single passed-around phone would expose every author. Sync strategy: `assign → write → seal → reveal (anonymized) → guess → keepsake`. The genuinely hard part is not sync but *leak-proofing* — ordering, timing, and word-count metadata must be normalized so no one can deduce the author from send order or length.

## v1 scope
- 3 players, one directed ring, one written note each, one round.
- One fixed prompt, one disguise-die per player.
- Reveal + single guess + a plain-text keepsake card per player.

## Out of scope
- Multiple rounds, roasts/mean mode, images.
- Fancy card templates, printing.
- Accounts, persistence beyond the session.

## Risks & unknowns
- With only 3 players the author is easy to guess (1-in-2); the anonymity game needs 5+ to bite — v1 proves the warmth, not the deduction.
- Sincerity vs. joke balance depends heavily on prompts.
- Metadata leaks (length, timing) could unmask authors.

## Done means
Three phones each write an anonymous note for their assigned target, the host shows all notes with no author labels, each player privately guesses their note's author, and every player can download a card of the kind words written about them — no score displayed.
