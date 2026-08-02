## Overview

Carried Forward is a public atlas (plus a paid alerting API) of **downstream patch debt**: for any open-source package, it shows every patch that FreeBSD ports, Debian, nixpkgs, Alpine, Gentoo, and Homebrew are carrying against it, how long each has been carried, and whether it ever landed upstream. For engineers choosing dependencies, for maintainers deciding what to upstream, and for companies that need to know which of their deps are actually kept alive by volunteer packagers.

## Problem

When a project stops accepting patches, nothing announces it. Instead, six distros independently write near-identical fixes and carry them forever. That signal — *four packagers patch this the same way and none of them got it merged* — is the single best predictor of "you will end up maintaining this yourself," and it is sitting in public git history that nobody has ever joined together. Stars, commit counts, and code-health scores all miss it entirely.

## How it works

Clone the packaging trees. For each package, extract its downstream patch set and reconstruct each patch's **lifeline** from git: birth commit (`--diff-filter=A`), death commit (`D`), and every rewrite between. Render a per-package chart of horizontal patch lifelines, one row per patch, colored by distro, with an open right end for "still carried today." Convergent patches — the same fix independently written in different trees — get stacked into a single fat band, which is the money shot: a wide multi-distro band that never terminates means an unowned, de-facto fork.

Packages get a **carry score**: median carry age × distro breadth × convergence. Users watch packages; when a new patch is born in any distro, or an old one crosses a carry-age threshold, they get a webhook.

## Technical approach

- Sources, all free git: `git.FreeBSD.org/ports.git` (`files/patch-*`), Debian via `sources.debian.org/api/` and salsa (`debian/patches` + `series`), `NixOS/nixpkgs` (`.patch` files and `fetchpatch` URLs in `.nix`), `alpinelinux/aports` (APKBUILD `source=` patches), Gentoo `FILESDIR`, Homebrew `patch do ... __END__` blocks.
- Parse unified diffs into hunks; normalize by stripping line numbers, whitespace, and context, keeping only added/removed lines. Fingerprint each hunk with a 128-perm MinHash; index in an LSH table at Jaccard ≥ 0.7 to cluster convergent patches across distros.
- **Hard part: "did it get upstreamed?"** There is no link between a distro patch and an upstream commit. Approach: fetch upstream at the distro's pinned version and at HEAD, and fuzzy-search the patch's added lines (token shingles, ≥0.85 similarity) in the corresponding file. Present as upstreamed / superseded / still carried, with a confidence, and let humans correct it via PRs to a public overrides file.
- Storage: Postgres (packages, patches, revisions, clusters) + a static JSON build for the front-end. Front-end: SvelteKit + D3 lifeline chart.

## v1 scope

- FreeBSD ports + Debian only
- Top 500 packages by presence in both trees
- Lifeline chart + carry score, static site, no accounts
- Convergence clustering; upstreamed-detection behind a "beta" label

## Out of scope

Vulnerability correlation, license analysis, auto-filing upstream PRs, SBOM ingestion.

## Risks & unknowns

Patch-file conventions vary enough that parsers rot; Debian patches are often already-upstream backports, which would inflate scores unless the version-pin check is right; the fuzzy upstream match is the whole credibility of the product.

## Done means

Given a package name, the site renders its patch lifelines across two distros in under 500ms, correctly identifies at least one patch carried >5 years in both, and the convergence cluster for that patch contains both distros' versions.
