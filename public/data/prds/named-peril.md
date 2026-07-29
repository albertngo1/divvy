## Overview
Named Peril is a supply-chain risk *underwriter*, not another scanner. You point it at a repo; it returns a priced quote: "$1,840/yr to cover a compromised-dependency incident in this service, $25k limit, 30-day waiting period." The pricing model, the base rates, and the loss simulation are all published. For engineering leaders who have to justify security spend to a CFO, and eventually for MGAs/brokers who want a technical rating engine for cyber riders.

## Problem
Every SCA tool emits a severity score. Severity scores are free to be wrong, so they are wrong constantly — CVSS 9.8 on a dev-only transitive dep nobody executes. Meanwhile the actual npm/GitHub Actions compromises that hurt (event-stream, ua-parser-js, the Actions token-exfil waves) were never a CVE at all; they were a publish-credential failure at a two-maintainer package. Nobody prices the difference, so nobody calibrates. The discipline that forces calibration is having to write the check.

## How it works
1. Ingest `package-lock.json` / `pnpm-lock.yaml` and the repo's `.github/workflows/*`.
2. For each package-version, pull features: maintainer count and account age, 2FA/provenance attestation presence (npm registry `_npmUser`, Sigstore attestations), install-script presence, publish cadence irregularity, download rank, days-since-last-publish, org vs personal namespace, whether the package is reachable at runtime vs dev-only, and for Actions: unpinned `uses:` refs, `pull_request_target`, secret exposure in the job graph.
3. Fit a hazard rate per package-year against a hand-curated ground-truth incident set (~150 documented npm/PyPI/Actions compromises with dates).
4. Monte Carlo the *portfolio*: 10k trials, with correlation injected via shared-maintainer and shared-org graphs (one compromised maintainer takes down every package they own — this is where naive independent-risk math is catastrophically wrong).
5. Multiply expected loss by a severity distribution (your declared blast radius: secrets in CI? prod deploy path?) and a loading factor → premium. Show the full waterfall: which 8 packages drive 70% of the premium, and what pinning/vendoring each would save you per year.

## Technical approach
Python + DuckDB for the feature warehouse; deps.dev BigQuery + OSV.dev + npm registry API + GitHub GraphQL as sources. Model: logistic hazard (scikit-learn) with a Beta-Binomial prior because positives are extremely rare; correlation via a Gaussian copula over the maintainer bipartite graph. FastAPI serves quotes; a GitHub App re-quotes on every lockfile change and comments the *delta premium* on the PR ("this bump costs you $210/yr").
The genuinely hard part: base rates are tiny (~1e-4/package-year), heavily censored (compromises found late or never), and correlated. Honest wide credible intervals matter more than a point estimate.

## v1 scope
- npm only, one lockfile, CLI that prints a premium and the top-10 cost drivers
- 60-incident ground truth, hand-labeled in a CSV
- No actual insurance — quote only, stamped "indicative"
- Public methodology page with the fitted coefficients

## Out of scope
Actually binding coverage, claims handling, regulatory filings, PyPI/crates, runtime reachability analysis via call graphs.

## Risks & unknowns
Positives are too sparse to fit anything defensible — mitigate by shipping intervals, not points. Insurance language invites regulatory attention; v1 stays a "risk report priced in dollars." Will engineers buy a number, or do only finance people care?

## Done means
Given two real repos — one pinned/provenance-attested, one full of unpinned two-maintainer packages with install scripts — the engine quotes premiums differing by >5x, and the waterfall names the specific packages driving it.
