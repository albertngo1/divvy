## Overview
Divide is a two-player (and solo-roguelike) deckbuilder about building the smallest possible living cell. Each card is a gene, a metabolic pathway, or a structural part. You draft, install, and prune your genome until it can do the one thing life must do: copy itself. It's for the tabletop-strategy crowd and anyone who found the 'cell built from scratch' headline more thrilling than any dungeon.

## Problem
Synthetic biology is genuinely the most dramatic engineering story going, but it's locked behind papers. Meanwhile deckbuilders keep reskinning swords and mana. There's no game that makes the *minimal genome* — the real scientific goal of stripping a cell to the fewest genes that still divide — into a tense, legible decision.

## How it works
Each turn you draw genes and spend a limited ATP budget to express them. Every gene has upkeep. Add a ribosome cluster and you translate faster but burn more ATP; add a repair gene and you survive mutation events but bloat the genome. A shared 'environment deck' fires stressors (heat shock, nutrient crash, a phage). Your cell has a Fitness track and a Division meter; the meter only fills when metabolism, replication, and membrane integrity are all above threshold *simultaneously* — the squeeze is keeping a lean genome balanced. First to divide twice wins. Mischief: you can inject a 'jumping gene' into an opponent's genome.

## Technical approach
Browser game, TypeScript + a lightweight ECS (each gene is an entity with metabolic/structural components). Deterministic turn resolver so PvP can be lockstep over WebRTC (PeerJS) — no server needed for v1. Card data authored in JSON, seeded from the real JCVI-syn3.0 minimal gene set (~473 genes) grouped into ~60 playable archetypes with flavor pulled from UniProt annotations. The genuinely hard part is the balance simulation: I'll build a headless self-play harness that runs thousands of random-agent games to detect dominant cards and tune upkeep/yield numbers before humans touch it.

## v1 scope
- 40 gene cards across 5 systems (metabolism, replication, membrane, repair, expression)
- Solo mode vs. a scripted environment deck only
- Single-screen board, drag-to-install, ATP/Fitness/Division meters
- Local hotseat two-player

## Out of scope
- Online matchmaking, accounts, ranked ladder
- Real DNA sequence accuracy or a codon model
- Mobile layout, animations beyond meter tweens

## Risks & unknowns
- Balance could be brutal to tune; self-play harness is the mitigation but eats the weekend.
- 'Feels like homework' risk — flavor must stay punchy, not a biology lecture.

## Done means
Two people can play a hotseat game start to finish, someone's cell divides twice and wins, and the self-play harness reports no single card appearing in >70% of winning genomes.
