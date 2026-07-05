## Overview
Detached Head is a roguelike that generates its dungeon from a real git repository's commit graph. Point it at any repo (or a bundled tutorial repo) and the commit DAG becomes the map: commits are rooms, edges are corridors, branches are wings, HEAD is you. It's built for the crowd from the 'why don't people use git properly' post — devs who fear rebase and reflog — teaching git's mental model by making you *inhabit* the object graph instead of reading a diagram.

## Problem
Git's data model is genuinely simple but taught as a spell-list of commands, so people cargo-cult and panic at detached HEAD or a botched rebase. Existing 'learn git' tools (visualizers, Katacoda) are diagrams you watch, not systems you fight through. Nobody's made the DAG a place you *survive in*, where the danger teaches the shape.

## How it works
The commit graph is rendered as a top-down dungeon. You move HEAD room-to-room along parent/child edges. Merge commits are junctions; a real merge conflict in history spawns a monster you must resolve (pick a side / combine) to pass. Spells map to git ops: `cherry-pick` teleports a room's loot to you, `rebase` replays your current branch's rooms onto another anchor (visibly re-laying corridors), `reset --hard` is a risky retreat that deletes rooms behind you, `reflog` is a resurrection scroll that recovers a room you 'lost.' Detached HEAD is a literal status effect: you're off the branch's safe path and can wander into orphaned commits. Win by reaching a goal commit (e.g. a tagged release) alive.

## Technical approach
Stack: TypeScript + isomorphic-git (or libgit2 via WASM) reading a repo in-browser from the File System Access API, or a small local CLI/TUI in Node. Parse the commit graph into nodes {sha, parents, tree, message, isMerge} and lay it out with a DAG layout (dagre / Sugiyama layering) mapped to a grid. Combat/loot are deterministic functions of commit metadata (diff size = room size, files touched = enemies, conflict markers in history = boss). Roguelike core is a standard turn loop + FOV. The genuinely hard part: making destructive git spells (rebase/reset) manipulate an in-memory model that stays *faithful* to real git semantics so the lessons transfer — and laying out large real DAGs into a legible, traversable dungeon without spaghetti.

## v1 scope
- Load a bundled small demo repo, render its DAG as rooms/corridors
- Move HEAD along edges; detached-HEAD status effect when off-branch
- Three spells: cherry-pick, rebase, reflog — operating on the in-memory model
- One merge-conflict monster you must resolve to pass
- Reach the tagged goal commit = win

## Out of scope
- Writing back to the real repo (read-only; simulation only)
- Multiplayer, procedural non-git dungeons, large-monorepo performance
- Full git command surface (stash, submodules, worktrees)

## Risks & unknowns
- DAG-to-legible-dungeon layout for messy real histories
- Keeping simulated ops semantically honest enough to actually teach
- Balancing 'fun roguelike' vs 'accurate git' — either can crowd the other out

## Done means
I open the demo repo, walk HEAD through its commit rooms, get the detached-HEAD effect when I step off a branch, cast rebase and watch my branch's rooms re-lay onto a new anchor consistent with what real git would produce, resolve a merge-conflict monster, and reach the goal tag — with no changes written to disk.
