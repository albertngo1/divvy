## Overview
Second Owner is a CLI + static report that reconstructs the *unannounced* ownership history of a package by forensic analysis of its published artifacts. For every release of a PyPI/npm package it extracts a fingerprint of the machine and toolchain that built the archive, detects changepoints in that fingerprint, and shows you a timeline segmented into "hands" — distinct build environments — annotated with whether the registry's maintainer list changed at the same moment. It's for anyone doing dependency due diligence: security teams, distro maintainers, and paranoid solo devs.

## Problem
Supply-chain compromise almost always begins with a handoff — a burned-out maintainer hands the keys to a friendly stranger, or an account is taken over. Registries surface maintainer lists as *current state*, not as a diffable history, and account takeovers change nothing visible at all. Meanwhile every archive ever published leaks a rich, unintentional signature of the machine that made it. Nobody reads it.

## How it works
For each release, download the sdist/wheel/tarball and extract a feature vector:
- **gzip header**: OS byte (3=Unix, 0=FAT/Windows), MTIME zero-vs-real, FNAME flag, XFL (compression level)
- **tar members**: `uname`/`gname`, uid/gid, mode bits, PAX vs USTAR format, member ordering (readdir order differs by filesystem), presence of `./` prefixes
- **zip (wheels)**: DOS local timestamps in the central directory vs the registry's UTC `upload_time` → the publisher's **UTC offset**, plus Unix-extra-field presence, and `Generator:` from `WHEEL`
- **metadata**: npm `_nodeVersion`/`_npmVersion`, setuptools/hatch/poetry version, line endings, whether Sigstore/npm-provenance attestation exists
- **deflate dialect**: block-boundary and Huffman-table statistics distinguish zlib vs libdeflate vs Go's flate vs Python's zlib at level N

Hamming-style distance over the vector feeds a changepoint detector (PELT on the categorical mismatch series) with a per-package volatility baseline — chatty packages need a bigger jump. Segments are joined against the registry's maintainer-list history. Output: an HTML timeline of colored "hands" bands, each release a tick, with an evidence table per changepoint ("UTC+3 → UTC-5, uname jenkins → root, gzip OS 3 → 0").

## Technical approach
Python. `httpx` against `https://pypi.org/pypi/<pkg>/json` and `https://registry.npmjs.org/<pkg>`; parse archives with `tarfile`/`zipfile` plus a hand-rolled gzip/deflate header reader (stdlib won't expose OS byte or XFL). SQLite store: `release(pkg, version, upload_time, fingerprint_json)`, `segment(pkg, start, end, evidence)`. Attestation-aware: a release with npm provenance is labeled "CI-built" and its fingerprint tracks the GitHub runner image, so runner upgrades are expected noise rather than a handoff.

The genuinely hard part is false positives: switching from `setup.py sdist` to `hatch`, or GitHub bumping `ubuntu-latest`, both look like a new pair of hands. Mitigation is a corpus-wide prior — learn which feature transitions are common ecosystem-wide (toolchain churn) versus rare and person-specific (timezone, uname, uid).

## v1 scope
- PyPI only, sdists only
- Four features: gzip OS byte, tar uname, UTC offset from wheel/zip timestamps, `Generator` tag
- Naive changepoint: any release where ≥2 features flip and stay flipped
- `secondowner requests` prints a text timeline; `--html` writes one file

## Out of scope
npm/crates/AUR, deflate-dialect classification, malicious-diff analysis, any "risk score", continuous monitoring service.

## Risks & unknowns
Reproducible-build efforts deliberately zero out exactly these fields, blinding the technique on the best-behaved packages (that itself is a finding). Old releases may be re-uploaded or normalized by the registry. Publishing timezone inference is genuinely privacy-sensitive for maintainers — the tool should report offsets, never locations, and I should think hard before making a public dashboard.

## Done means
Running it on 20 packages with known, documented maintainer transitions recovers ≥12 of them within one release of the true handoff, with <1 spurious segment per package on a control set of 20 single-maintainer packages.
