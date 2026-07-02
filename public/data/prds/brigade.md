## Overview
Brigade is a satirical single-player strategy sim inspired by the arXiv field experiment on bot-driven behavioral contagion on Reddit. You play a shadowy influence shop hired to shift a simulated online community's opinion on a topic — using sockpuppet accounts, upvotes, and well-timed posts — while a platform detector learns to spot your coordination. It's a *Papers, Please*-style ethics-through-mechanics game: you feel exactly how cheap and how fragile manufactured consensus is.

## Problem
Everyone has read the "the site is full of bots" thread; almost nobody has an intuition for the actual dynamics — how many puppets it takes, how timing and account age matter, why coordinated rings get caught. A playable model teaches that better than an explainer, and it's a genuinely fun optimization puzzle: maximize opinion shift per unit of detection risk.

## How it works
Each round, a simulated forum of ~500 agents holds an opinion on a scalar issue and updates it by reading top-voted comments from neighbors. You spend a budget on accounts (each with age, karma, credibility), then act: post a comment (opinion + persuasiveness), upvote to boost reach, or lie low to age accounts. The **detector** raises a suspicion meter based on your ring's timing synchrony, textual similarity, and voting overlap; cross a threshold and a cluster gets banned, wiping their influence. Win by moving the community's median opinion past a target before the meter maxes — or before an organic counter-narrative snuffs you out.

## Technical approach
Browser, TypeScript, no backend. Opinion dynamics use a **bounded-confidence (Deffuant/Hegselmann-Krause) model**: agents only shift toward opinions within a tolerance, so extreme puppets get ignored — forcing you to seed moderates first. Reach is a simple upvote-weighted feed ranker. The detector is a transparent scoring function over three features (inter-post time variance, n-gram similarity across your accounts via cosine on TF-IDF vectors, co-voting Jaccard) — deliberately legible so players learn what real detectors watch. Date-seeded daily scenario (topic + starting distribution) for a shareable score. Hard part: tuning so both brute force (many puppets, fast) and finesse (few, patient) are viable strategies, not one dominant line.

## v1 scope
- One issue, ~200 agents, bounded-confidence updates
- 3 account types, 3 actions (post/upvote/idle)
- Detector with the three features above and a visible meter
- Win/lose screen with a shareable score

## Out of scope
- Real LLM-generated comment text
- Multiplayer / real platforms
- Multi-topic campaigns, narrative story mode

## Risks & unknowns
- Tone: must read as *cautionary/satirical*, not a how-to; framing and detector prominence matter.
- Opinion-dynamics tuning is finicky; wrong params make it trivially winnable or hopeless.
- Detection feature legibility vs. challenge — too transparent and it's solved on paper.

## Done means
A player wins one scenario with a low-puppet patient strategy and another with a high-puppet blitz, and in a third run visibly triggers a coordinated-ban cascade they can trace to synchronized posting.
