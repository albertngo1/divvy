## Overview

Prior Version is a subscription evidence service that continuously captures the *behavioral surface* of consumer mobile apps — onboarding flows, default privacy toggles, notification cadence, age gates, autoplay, streak/infinite-scroll mechanics — and preserves each observation as a timestamped, hash-chained record tied to a specific app build. Buyers: plaintiff-side product-liability firms, state attorneys general, child-safety NGOs, academic HCI researchers, and compliance teams who need to prove what their own app looked like on a given date.

## Problem

The New Mexico judgment against Meta is the front edge of a wave of design-defect litigation. Every one of those cases turns on a factual question nobody can currently answer cheaply: *what did the app actually do on the day the plaintiff was 13?* Screenshots in discovery come from the defendant. The Wayback Machine archives marketing pages, not the signup funnel. App binaries survive on APKMirror but nobody has run them and written down what the defaults were. The evidence rots faster than the docket moves.

## How it works

A fleet of emulators and a small rack of real devices runs a scripted *persona*: install build X, create an account with birthdate 2011-04-02, decline every optional prompt, screen-record the whole thing, then sit idle for 72 hours logging every push notification. Each run emits a bundle — MP4, per-screen accessibility tree dumps, network metadata (not payloads), APK hash, device fingerprint, wall-clock from an RFC 3161 timestamp authority — hashed into an append-only Merkle log. The web app is a **timeline viewer**: pick an app, pick an attribute (`default_public_profile`, `age_gate_type`, `notifications_per_idle_day`), and see a stepped line across three years of builds, each step click-through to the exact frame where it changed.

## Technical approach

Stack: Python + Appium/UIAutomator2 driving Android emulators on bare metal (cheap RAM is the constraint; run 12 per box), Playwright for the web equivalents. Historical builds pulled from APKMirror/APKPure archives keyed by versionCode; `androguard` extracts manifest permissions and `versionName` as structured metadata for free. Screen understanding: the AX tree is the ground truth; a VLM pass over keyframes labels each screen into a flow taxonomy (`consent`, `age_entry`, `default_settings`, `dark_pattern:confirmshaming`) with a human review queue, because a mislabeled screen in a court exhibit is worse than a missing one. Attribute extraction is a per-app YAML of assertions ("on the settings screen, the toggle labeled /Suggest my account/ reads ON") evaluated against the AX tree — deterministic, diffable, greppable. Provenance: SHA-256 leaves into a daily-published Merkle root, plus an RFC 3161 token; an affidavit generator renders the chain-of-custody exhibit as PDF.

The genuinely hard part is not automation — it is *account creation at scale without fraud*. Real accounts need real phone numbers and consented adult-supervised minor personas; getting this defensible (IRB-style protocol, disclosed research accounts, no scraping of other users' data) is the moat and the thing that keeps CFAA and ToS risk survivable.

## v1 scope

- Three apps, Android only, back-catalog of ~20 builds each from APKMirror
- One persona (13-year-old signup), one flow (onboarding through first settings screen)
- Twelve hand-written YAML assertions per app
- Timeline viewer showing one attribute changing over time, frame-linked
- Manual Merkle root publishing, once a day, to a public gist

## Out of scope

iOS (jailbreak/sideload nightmare), payload-level network capture, any real minor's data, algorithmic feed analysis, automated expert reports.

## Risks & unknowns

ToS termination and CFAA exposure; server-side feature flags mean an old binary may not reproduce old behavior (must be disclosed on every exhibit); admissibility standards vary by jurisdiction; defendants will argue emulator ≠ device.

## Done means

Given any two build dates for a covered app, the viewer produces a side-by-side of the same onboarding screen with a diffed assertion table, and exports a PDF exhibit whose hashes verify against the published Merkle root using a 40-line standalone script.
