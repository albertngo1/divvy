## Overview
Sorry is a browser deckbuilder that teaches proof-assistant intuition by turning theorem-proving into a roguelike combat loop. For programmers curious about Lean/mathlib but scared off by the syntax wall — and for Lean users who want a coffee-break puzzle.

## Problem
mathlib4 is trending and Lean is having a moment, but the on-ramp is brutal: tactics feel like arcane incantations and the feedback loop (open editor, fight the elaborator) is slow. Meanwhile deckbuilders have trained millions to reason about combo, resource, and state. Nobody has mapped the two.

## How it works
Each 'enemy' is a proof goal (a hypothesis context + a target proposition). Your hand holds tactic cards — `intro`, `apply`, `rw`, `simp`, `cases`, `exact` — each with an energy cost. Playing a card transforms the goal state exactly as the real tactic would; some split one goal into several (multi-enemy fights), some close a goal (a kill). You draft new tactic cards between fights and build synergies (`simp` relics that auto-close arithmetic; a `ring` bomb). The signature card is **Sorry**: it instantly closes any goal but costs you the run's 'honesty' meter — a knowing joke to every Lean user, and a real lesson that `sorry` is a cheat that leaves a hole.

## Technical approach
Stack: TypeScript + a small React/Canvas UI. Two build paths: (1) v1 uses *scripted* goal-state transitions — a hand-authored puzzle graph where each (goal, card) → next-goal is precomputed, so no prover needed. (2) Later, wire a real Lean 4 server (WASM-compiled `lean4web` kernel or a backend `lake` process exposing the InfoView goal state) so cards execute genuine tactics and legality is checked by Lean itself. Data model: a goal is `{hyps: Term[], target: Term}` rendered with KaTeX; cards are `{tactic, cost, transform}`. Key structure: a DAG of goal states with A* to guarantee each puzzle is solvable within the deck. Hard part: rendering real Lean goal states legibly and mapping arbitrary tactic output back into 'enemies' without overwhelming the player — needs aggressive goal simplification/pretty-printing.

## v1 scope
- 8 hand-authored puzzles, no live Lean
- 6 tactic cards + Sorry
- Energy, draw, single 'floor' of 3 fights
- Win/lose screen with honesty meter

## Out of scope
- Live Lean kernel integration
- User-imported theorems from real mathlib
- Multiplayer/daily challenge

## Risks & unknowns
- Scripted puzzles may feel fake to real Lean users; live kernel is the payoff but heavy
- Balancing 'accurate to Lean' vs 'fun' — real proofs branch ugly
- Teaching value unproven without playtests

## Done means
A player with zero Lean experience can beat the 3-fight floor, and every card's effect on the goal state matches what the corresponding real Lean tactic would do on that goal (verified against the actual prover for the 8 authored puzzles).
