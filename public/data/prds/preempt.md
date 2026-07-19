## Overview
Preempt is a browser reflex/juggling game for one player (with a co-op multi-core mode) that turns a Linux CPU scheduler into something you can *feel*. Balls falling toward the floor are runnable processes; your cursor/hand is the CPU. It's a serious tool — the scheduler — made into a toy, born from the collision of the Lobsters 'Studying Linux Schedulers, and Why Metrics Matter' post and the arXiv paper 'Catch, Throw, Repeat: Planning for Human-Robot Partner Juggling.'

## Problem
Schedulers are invisible and abstractly taught: fairness vs. latency vs. throughput are words on a slide. Nobody *feels* why preemption exists or why starvation is bad. Meanwhile people want a twitchy 60-second game that is secretly educational.

## How it works
Processes spawn at the top as colored balls, each with: a burst length (how long you must 'hold' it on the CPU), a priority (niceness), and a deadline (falls to the floor = starvation = game over risk). You click/grab a ball to run it on your single CPU hand; while held it drains its burst but every *other* ball keeps falling. You must throw balls back up (re-queue) to buy time. Every grab is a context switch that costs a few frames — juggle too aggressively and overhead eats you. A live meter shows p99 latency, throughput, and fairness (Jain's index). Levels introduce real policies as constraints: FIFO mode forbids reordering; Round-Robin forces you to swap every quantum; CFS mode rewards keeping vruntime balanced. Multi-core co-op gives each player a hand and a shared runqueue, and cache-affinity bonuses reward keeping a ball on the same hand.

## Technical approach
Pure client-side: TypeScript + Canvas/PixiJS, fixed-timestep loop, no backend. Physics is trivial gravity + toss arcs. The interesting data structure is the runqueue itself, modeled as a real red-black tree (CFS) so the scoreboard can show your live vruntime ordering; policies are pluggable scheduler objects with `pick_next()` and `on_tick()`. The genuinely hard part is tuning spawn curves so the game teaches the *right* intuition — e.g., a burst of tiny high-priority balls should make FIFO players viscerally fail on latency while CFS players survive. Metrics (Jain fairness, p99 wait) are computed exactly as in the blog post and shown as the score.

## v1 scope
- Single CPU, one policy (manual), gravity + grab + toss
- Three metrics live: latency, throughput, fairness
- Starvation = you lose; 90-second runs; local high score
- One 'lesson' overlay explaining what just killed you

## Out of scope
- Multi-core co-op, netcode
- Real /proc integration
- Mobile touch tuning

## Risks & unknowns
- Might feel like generic juggling if policies aren't legible mid-play
- Teaching-vs-fun tension in spawn tuning

## Done means
A stranger plays three rounds, loses to starvation once and to latency once, and can correctly say why RR hurt their p99 without reading docs.
