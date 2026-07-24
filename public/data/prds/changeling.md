## Overview
Changeling is a solo macOS forensics tool (menubar app + CLI) that maintains a tamper-evident ledger of every executable in `/Applications`, `~/Applications`, and Homebrew casks, and alerts you the moment a Mach-O binary inside a trusted bundle is replaced *without* an honest version bump or a fresh notarization stamp. For anyone who installs software and reasonably expects `AppName 3.2.1` to stay byte-identical between launches.

## Problem
The mysk.blog disclosure showed that an app's executable can be silently overwritten in place — same bundle, same version string, same icon — because macOS re-validates code signing lazily and many auto-updaters (Sparkle, custom) blast new binaries with no user-visible diff. A supply-chain attacker or a rogue updater can swap the guts of a signed app you already trusted. Nothing in Finder tells you.

## How it works
On first run Changeling walks every bundle and records, per executable: SHA-256 of the Mach-O, the code-signing Team ID + CDHash (`codesign --display --verbose`), notarization ticket presence (`spctl`), `CFBundleShortVersionString`, and mtime. This is the baseline ledger. A `launchd` agent + FSEvents watcher re-checks any bundle whose files change. The alarm fires on the *suspicious* combination: **executable hash changed AND version string unchanged**, or **CDHash changed AND Team ID changed** (re-signed by a different party), or notarization ticket disappeared. Each alert opens a diff card: old vs new hash, old vs new signer, the triggering process (which updater wrote it), and a one-click quarantine (`chmod 000` + move to a holding folder).

## Technical approach
Swift menubar shell + a Rust/Go core for the walk. Ledger is a local SQLite DB with an append-only, hash-chained audit table (each row includes prev-row hash) so the ledger itself is tamper-evident. Mach-O parsing via the `object`/`goblin` crate to hash only the `__TEXT` + load commands (stable across ad-hoc resign noise). Signing facts shelled out to `codesign`/`spctl` and cached. FSEvents gives the writing process PID via `proc_pidpath`. The genuinely hard part: distinguishing a *legitimate* update (version bumped, still same Team ID, notarized) from a silent swap, without drowning the user in Sparkle-update noise — a small rule engine with a per-app "expected updater" allowlist.

## v1 scope
- CLI: `changeling baseline`, `changeling scan`, `changeling watch`.
- Detect: exec-hash-changed-but-version-same; Team-ID-changed; notarization-lost.
- Hash-chained SQLite ledger.
- Plaintext + JSON alert report.

## Out of scope
- Menubar GUI polish, kernel extensions, real-time blocking, Windows/Linux, network reputation lookups.

## Risks & unknowns
- False-positive storm from legit auto-updaters that reuse version strings.
- Requires Full Disk Access; some system apps resist inspection.
- An attacker with root can rewrite the ledger — hash-chaining detects but can't prevent.

## Done means
Install an app, run `changeling baseline`, manually `cp` a different signed binary over its executable while keeping the version string, and Changeling flags exactly that bundle within 5 seconds with old/new hash + signer diff, while a normal Sparkle version-bumping update produces no alert.
