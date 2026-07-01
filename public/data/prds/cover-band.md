## Overview
Cover Band is a browser toy plus tiny party game for programmers. Feed it one small function; it breeds dozens of variants that look completely different but are provably behavior-identical, then challenges you (or friends) to pick which snippets are secret twins.

## Problem
Google's copybara exists to propagate ONE canonical form of code faithfully across repos. That's the itch inverted: developers rarely get a visceral feel for how many radically-different-looking programs are the *same* program. We fetishize a single 'clean' style and forget the equivalence class underneath. Cover Band celebrates the drift copybara suppresses.

## How it works
Paste a pure-ish JS/TS function and a handful of test cases. Cover Band applies a chain of deterministic, semantics-preserving AST transforms — rename locals, inline a temp, extract a subexpression, flip a ternary, reorder commutative operands, swap a for-loop for reduce, De Morgan a boolean. Each transform produces a child; children breed children. Every variant is run against your tests (the 'oracle'); any that diverge are pruned. The survivors are laid out as a phylogenetic tree, and any two leaves are guaranteed twins. Game mode hides the tree and shows a 3x3 grid: find the matching pair before the timer runs out.

## Technical approach
Stack: Vite + TypeScript, Babel (`@babel/parser`, `@babel/traverse`, `@babel/generator`) or ts-morph for AST work, all client-side. Oracle: run each variant in a sandboxed Web Worker with a frozen global, execute the user's test cases, hash the output vector. Data model: `Variant { id, parentId, code, transformName, outputHash }`; tree = adjacency list keyed by outputHash-equal groups. Transforms are pure functions `(ast) => ast[]`. Rendering: d3 tree layout. The genuinely hard part is guaranteeing transforms preserve semantics without a full type system — solved pragmatically by making transforms conservative (bail on anything with side effects, `this`, closures over mutated vars) and letting the test oracle catch any that slip through.

## v1 scope
- One seed function, ≤5 hand-written test cases
- 6 transforms, breadth-first to depth 4
- Tree view + 'reveal twins' toggle
- No accounts, no save, no game mode yet

## Out of scope
- Multi-file / whole-repo diffing
- Languages beyond JS/TS
- Proving equivalence formally (tests are the oracle)
- LLM-based mutation

## Risks & unknowns
- A 'preserving' transform that isn't (nondeterminism, floats) — mitigated by the oracle pruning divergent leaves
- Combinatorial blowup — cap breadth, dedupe by generated-code hash
- Is 'spot the twin' actually fun, or just a curiosity? Playtest early

## Done means
Paste `sum(arr)` plus 3 tests, click Breed, and see ≥8 visually-distinct variants in a tree, each passing all tests, with a working toggle that highlights which leaves produce identical output hashes.
