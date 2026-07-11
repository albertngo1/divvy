## Overview
Reorg is a browser-based restructuring tycoon that loads your real `package-lock.json` (or `pnpm-lock.yaml`) and renders your dependency tree as a corporate org chart. You play a cost-cutting CEO whose job is to shrink 'headcount' (install size) without breaking the company (a passing build). For JS devs horrified by their own `node_modules`.

## Problem
Dependency bloat is abstract and guilt-free—`du -sh node_modules` is a number, not a feeling. Nobody enjoys auditing transitive deps. But everyone enjoys firing a useless middle manager. Reorg reframes the tedious chore of dependency pruning as satisfying corporate bloodletting.

## How it works
Each package is an 'employee' with a salary (its own unpacked bytes) and direct reports (dependencies it pulls in). You click an employee to fire them. Firing a leaf saves their salary. Firing a manager triggers a **layoff cascade**: any report no longer referenced by *anyone else* also gets walked out of the building, animated node-by-node down the chart. A running 'quarterly savings' counter ticks up. But some employees are load-bearing: fire a package your code actually imports and the build turns red—you get a 'wrongful termination lawsuit' and lose the round. Score = total bytes eliminated across a clean build. Daily challenge mode seeds everyone the same starter repo.

## Technical approach
Pure client-side. Parse the lockfile to a dependency graph; fetch each package's unpacked size from the local `node_modules` or the npm registry `dist.unpackedSize` field. Reference-count edges to compute cascades (a node dies when its in-degree from surviving nodes hits zero). Render with **graphviz-wasm** (the trending `xflr6/graphviz` Python interface has a JS cousin, `@hpcc-js/wasm`) using a `dot` layout, or d3-dag for interactivity. 'Load-bearing' detection: static-scan the project's own source with `es-module-lexer`/`cjs-module-lexer` to find top-level imports, then trace which lockfile packages are transitively reachable from them—those are protected, everything else is fair game. The hard part is the cascade correctness (correct reference counting across `peerDependencies` and dedup hoisting) and making the org-chart relayout feel snappy after each firing.

## v1 scope
- Drag-drop a `package-lock.json`, render the org chart
- Click-to-fire with animated cascade + live savings counter
- Static import scan to mark load-bearing packages (lose if you fire one)
- Shareable end score ('Cut $2.3MB of headcount')

## Out of scope
- Actually editing the lockfile / applying the layoffs
- Multi-language (Cargo, pip) beyond npm
- Runtime import detection (dynamic `require`)

## Risks & unknowns
- Static import scan misses dynamic imports → false 'load-bearing' misses; mitigate by being conservative (protect anything reachable)
- Unpacked-size fetch is slow for huge trees; cache registry responses
- Org-chart layout gets unreadable past ~500 nodes; collapse subtrees

## Done means
I drop in a real repo's lockfile, fire a middle-manager dep, watch 12 orphaned reports cascade out with a savings number, and firing a package my code imports reliably turns the build red and ends the run.
