## Overview
Nobody in Particular is a 5-player in-room game about k-anonymity and linkage attacks: privacy techniques usually discussed in database classes, applied to friends who know far too much about each other. The room jointly produces a printed census poster of itself. There are no points. Each player tries to keep their row on the poster without being identified, and the group tries to print as much detail as it can.

## Problem
Anonymity games tend to hide a single answer. Real privacy failures come from combining harmless facts: birth month, sibling count, and a coffee order together pick out one person. Friends are the perfect attackers because they bring outside knowledge. This game makes that tradeoff something you can hold in your hand.

## How it works
- **Each phone (private):** five questions: birth month, number of siblings, region you grew up in, usual coffee order, and dominant hand. Next to each answer is a generalization ladder: exact → range → category → asterisk. Only you can see your real values.
- **Host screen:** the poster draft, five rows in shuffled order showing everyone's generalized values live, plus an ink meter. Every step up a ladder drains ink. A row that matches no other row visibly glows as unique.
- **Blur phase (90 seconds):** everyone adjusts their ladders at the same time. The formal k=2 glow is only a hint. The real threat is what your friends already know about you, and only you can judge that.
- **Link phase:** each phone privately assigns every row to a player. A row correctly guessed by a majority is unmasked and blacked out on the keepsake.
- **End:** the poster prints with surviving rows at their final detail and blacked-out bars where people were unmasked. The ink meter becomes a caption: '61% of us is on this page.'

## Technical approach
- Socket.IO room over Tailscale Serve.
- `Player{id, truth[5], level[5]}` lives only on the server and is never broadcast. `Draft{rows: shuffledGeneralized[], ink}` goes to the host.
- Sync: phones send ladder changes, and the server rebroadcasts the generalized table throttled to 5 Hz. Row order is shuffled once when the phase starts and not again, so movement doesn't give anyone away.
- **Hard part:** live updates leak identity. If a row changes the moment Dana touches her phone, Dana is unmasked. Mitigation: batch changes into 3-second epochs and apply them all at once.

## v1 scope (humiliatingly small)
- 5 players, 5 fixed questions, 4-step ladders
- One blur phase, one link phase, majority rule
- Static poster rendered to PNG

## Out of scope (for now)
- Custom questions
- Choosing k other than 2, or l-diversity
- Multiple rounds or reputation carried between rounds

## Risks & unknowns
- Close friends may make every row trivially linkable, so everyone blurs to asterisks and the poster is empty. The question set has to be tuned.
- The epoch batching may still leak through someone's expression or posture. That may be part of the fun.
- Without a scoring hook, some groups may not care about ink.

## Done means
Five phones complete the blur and link phases. The host never shows ungeneralized values. Epoch batching hides which phone made a change: in a test log, a change cannot be traced to its sender. The PNG poster shows correctly blacked-out rows and the ink caption.
