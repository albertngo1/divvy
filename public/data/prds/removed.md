## Overview
Removed is a hidden-role logic-deduction game for 3–5 players. Every phone privately shows the same six-person family tree. The imposter's tree has exactly one relationship altered. Players answer kinship questions and deduce whose tree is off. For groups who like reasoning puzzles wrapped in a bluffing game.

## Problem
Deduction games rarely exploit STRUCTURED private data. A single edited edge in a shared graph is invisible on its face — it stays hidden until a question forces reasoning through that exact edge. That delayed, deterministic reveal is a different flavor of tension than word-guessing.

## How it works
The TV shows the current question and a running answer log — never the tree itself. Each phone privately renders the same tree: six named people, parent/sibling/spouse links. The imposter's phone has one edge mutated (a sibling link becomes a parent link, or two people's parentage is swapped). The imposter is told only: "One relationship on your tree is wrong — you don't know which."

The host poses four kinship questions in sequence ("Who is Rion's aunt?"). On each, every phone privately taps a name from buttons; answers lock SIMULTANEOUSLY, then reveal on the TV as a tally. Questions that don't touch the altered edge → unanimous. Questions that do → the imposter is the odd answer, unless they've deduced the discrepancy from earlier tallies and deliberately deviate toward the crowd. That's the core dilemma: answer honestly from your (wrong) tree and expose yourself, or gamble on matching. Finally, everyone privately votes the imposter.

Private vs shared: each phone holds a full private, divergent tree, answered simultaneously; the TV holds only questions and revealed tallies.

## Technical approach
Host tab + phone PWAs + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Tree = nodes[] + typed edges[] (parent/spouse). Server generates the honest tree, clones it, mutates one edge for the imposter, and precomputes correct answers per question for BOTH trees. Each round: broadcast question → collect locked simultaneous answers → reveal tally. Answer matching is exact (button IDs), so no fuzzy logic. The hard part isn't sync — it's AUTHORING a tree + ordered question set where the mutation stays hidden for the first question or two, then forces divergence, giving the imposter a real "match or reveal?" beat.

## v1 scope
- 3 players
- 1 authored 6-node tree + 1 mutation
- 4 fixed questions, simultaneous locked answers
- 1 vote + TV reveal
- Win/lose only

## Out of scope
Procedural tree generation; multiple mutations; scoring; extra roles; free-text answers.

## Risks & unknowns
The imposter could just copy the majority every time — needs at least one early question where the tally can't yet reveal the edge, forcing a blind commit. The tree may be too small to hide the edit; question ordering is load-bearing and fragile. Simultaneous locked taps mitigate peeking.

## Done means
Three phones each render the tree (one mutated); four questions run with simultaneous locked answers revealed on the TV; the group votes; the reveal shows the imposter and their altered edge — one round, no reloads.
