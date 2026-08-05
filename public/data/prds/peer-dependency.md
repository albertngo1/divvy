## Overview
A browser roguelike deckbuilder that generates its entire run from a `package-lock.json` you drop onto the page. For developers who want to feel something about their dependency tree other than dread. Flavored as a Bradbury-style abandoned house: the project's owners are gone, the postinstall scripts still fire on schedule.

## Problem
Dependency-tree visualizers all say the same thing — a big hairball, 1,400 nodes, you nod and close the tab. Nothing makes the *shape* of your tree legible: which packages are load-bearing, which are maintained by one exhausted person, which are two hops from something with an active advisory. A game makes you learn the topology because you have to survive it.

## How it works
Drop a lockfile. The game builds a deck: each direct dependency becomes a starting card. Card stats come from real metadata — unpacked size sets energy cost, transitive dep count sets weight, maintainer count sets fragility (a one-maintainer package breaks permanently after N plays), publish recency sets whether it arrives "brittle." Floors are dependency depth levels; you descend from your direct deps toward the leaves, and each room is a package you can consume for its card or strip for scrap. Packages with an OSV advisory are *tainted*: taking them is powerful and permanently shuffles a curse card into your deck that triggers on draw. Each floor's boss is the package with the highest betweenness centrality at that depth — the thing everything routes through. Beat it and you "pin" it, which is the run's only permanent upgrade.

## Technical approach
TypeScript, no backend, everything client-side (the lockfile never leaves the browser — say so loudly on the drop zone). Parse `package-lock.json` v2/v3 into a DAG; compute Brandes betweenness in a worker. Advisory lookup: one batched `POST https://api.osv.dev/v1/querybatch` with `{package: {ecosystem: 'npm', name}, version}` tuples. Maintainer counts and publish dates from the npm registry packument endpoint, cached in IndexedDB. Card generation is deterministic: `seed = sha256(name@version)` drives which of ~20 effect templates a card gets, so a package always plays the same way — but the *numbers* on it come from live metadata.

The genuinely hard part is balance across wildly different inputs. A 3-dependency project must not be trivial and a 2,000-dependency monorepo must not be soup. Solution: never use raw metadata values — compute percentile ranks *within the submitted graph*, then map percentiles onto a fixed power budget, and cap floor width by sampling depth-level packages weighted by betweenness so floors are always 6–9 rooms.

## v1 scope
- npm `package-lock.json` v3 only
- 12 effect templates, 3 floors, one boss
- Advisories = one curse card type, not a system
- No meta-progression, no save, one run per drop

## Out of scope
pnpm/yarn/Cargo/pip lockfiles, multiplayer anything, publishing runs, remediation advice.

## Risks & unknowns
npm registry rate limits on packument fetches for large trees (mitigate: batch, cache, degrade to size-only cards). "Metadata-generated cards" is the classic road to unbalanced mush — the percentile normalization is the whole bet. Also: is this fun for more than one drop? The hook is comparing two of your own projects.

## Done means
Dropping two different real lockfiles produces two runs that feel measurably different — different boss, different curse pressure, different viable strategy — and a player who beat floor 3 can name their project's most central package without being told.
