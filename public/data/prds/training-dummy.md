## Overview

A fighting-game training-mode heist for 3 players. The genre theft is training mode itself — the recorded dummy, the tell you learn to punish, the matchup knowledge. The twist is that the dummy is a person who has no idea they're the dummy.

## Problem

Fighting games are the most spectator-hostile genre at a party: two people play, six people watch a health bar. But the *actual* pleasure of a fighting game is a private one — noticing your opponent always blocks low after a throw. That noticing is the fun, and it's currently locked behind twenty hours of practice.

## How it works

The TV says: **LAB — 45 seconds. Beat the dummy.** Then everyone looks down.

Each phone privately shows a full one-on-one duel: your health, your dummy's health, three attack buttons (HIGH / LOW / THROW), and a hold-to-block pad you drag up or down. Resolution is timing-RPS: high beats low-block, low beats high-block, throw beats any block, any attack beats a throw attempt.

The secret: there is no CPU. The server routes inputs in a **directed ring** — A fights B's live inputs, B fights C's, C fights A's. So the person you are hitting is not the person hitting you, and no exchange is symmetric. Nobody is told this. The TV during the lab shows only three anonymous health bars twitching, no names, no lanes.

At 0:00 the TV reveals: *none of you fought a CPU.* Each phone then privately answers two questions — (1) which habit did your dummy have? (five options: the true computed tell plus four decoys derived from the other players' real stats) and (2) who was it?

Scoring: damage dealt + correct tell + correct identification, plus a bonus if nobody identified you. The best play is to be *boring* while exploiting someone else's tell — a fighting-game truth compressed into 45 seconds.

## Technical approach

Authoritative Socket.IO/PartyKit server at 20Hz. Data model: per directed edge `(attacker, defender)` a health pool and an exchange log; per player an input stream of `{t, type, dir}`. The server owns all three edges and streams each phone only its own edge's state.

Hard part: fairness under jitter. An input that arrives 120ms late must not lose an exchange the player visually won. The server does not resolve by arrival order — it buckets inputs into fixed 100ms cadence slots keyed by client-stamped time, clamped to a 200ms tolerance, and resolves the bucket. Phones render an optimistic swing and reconcile with a forgiving hit-spark rather than rewinding animation. Tell computation is plain stats over the input stream (throw rate, post-block bias, mash interval); decoys are the same stats computed for other players, so every option is true of *someone*.

## v1 scope

- Exactly 3 players, one 45-second lab, one ring
- 3 attacks + directional block, no combos, no meter, no movement
- One reveal, one tell guess, one identity guess
- Scoreboard on TV, no persistence

## Out of scope

Multiple rounds, character select, actual combo strings, replays, 4+ players, a real CPU fallback, rematches.

## Risks & unknowns

45 seconds of RPS may be too thin to generate a legible tell — may need to widen to 60s or narrow the option set. The reveal is a one-time trick; round two needs a different framing ("you know now — hide it"). Latency fairness is the make-or-break; if phones feel unresponsive the whole thing dies.

## Done means

Three phones run simultaneous private duels in a ring for 45 seconds with no visible input lag; the server correctly computes each player's dominant habit and it matches what a human observer would say; the reveal screen names the ring correctly; and at least one playtester says "wait, *you* were my dummy?"
