## Overview
Opted Out is a self-hosted harness that empirically tests whether a privacy toggle does anything. You name a setting — "Personalized ads: off," "Share diagnostics: off," "Location: never," "On-device processing only" — and it runs a controlled A/B capture, then emits a signed evidence bundle you can post, cite, or send to a regulator. For privacy researchers, journalists, and the kind of person who reads the settings screen.

## Problem
Every few months a story breaks that some toggle labeled off wasn't. Verifying such a claim today means a person with mitmproxy, a rooted device, and a free weekend — so almost nobody checks, and the checks that happen aren't reproducible by the next person. Meanwhile "private AI" and "on-device" have become marketing terms with zero consumer-side verification. The asymmetry is the whole problem: making the claim costs nothing, checking it costs a weekend.

## How it works
1. Point your phone (or a VM) at the harness as its network gateway; install its CA cert. It brings up a `mitmproxy` transparent proxy plus a full pcap tap.
2. Write a tiny YAML **probe**: the app, the toggle path, the stimulus to perform ("open feed, scroll 30 s, open Settings"), and the duration.
3. It runs the stimulus twice — toggle ON, toggle OFF — in randomized order, N repetitions, using `adb`/`xcrun simctl` UI automation to drive the taps identically.
4. It diffs the two conditions: destination hosts, TLS SNI/JA4 fingerprints, request counts, byte volumes, and — where TLS interception succeeds — decoded payload field names. Statistics, not anecdotes: a permutation test over repetitions, so "it phoned home once" doesn't become a headline.
5. Output: a Markdown report plus an evidence bundle (pcaps, flow dumps, screen recording, probe YAML, device fingerprint) hashed into a Merkle root and signed with `minisign`. Anyone can rerun the same probe and compare roots.

## Technical approach
Python orchestrator; `mitmproxy` scripted addon for flow capture, `tcpdump` for the raw tap (needed because pinned or QUIC-only traffic won't decrypt — you still get SNI, JA4, timing, and volume). Device drive via `adb shell input` + `uiautomator` dumps for Android, `xcrun simctl` + XCUITest for the iOS simulator. Data model: one run = `{probe_id, condition, rep, flows[], pcap_hash, ts}` in SQLite; hosts resolved to owners via a bundled copy of the Exodus Privacy tracker signature list and a PSL-based eTLD+1 rollup. The permutation test compares per-condition byte-to-third-party distributions across reps (Mann-Whitney, with the flow set as the unit). The genuinely hard part is **stimulus fidelity**: two runs of "scroll the feed" are never identical, and content-driven traffic variance dwarfs the telemetry signal — the fix is deterministic scripted gestures, a fixed account, airplane-mode-flush between reps, and reporting only differences that survive across randomized-order repetitions. Second hard part is certificate pinning: for pinned apps you fall back to metadata-only claims, and the report must say so explicitly rather than quietly under-reporting.

## v1 scope
- Android emulator only, one probe format, one toggle per probe
- 5 reps per condition, hosts + bytes + SNI only (no payload decode)
- Markdown report with a hashed bundle; signing optional
- Ship three example probes against real apps

## Out of scope
- iOS on real hardware, jailbreak/pinning bypass
- Any accusation language in the report — it reports observations
- A hosted service or public leaderboard

## Risks & unknowns
App ToS forbid this kind of instrumentation; the project must be framed as research on your own device and account. QUIC-only apps degrade the evidence to metadata. Variance may make small leaks statistically invisible with only 5 reps. Emulator-detecting apps may behave differently than real hardware, which weakens every claim.

## Done means
Running the same shipped probe on two different machines produces reports that agree on the set of third-party hosts contacted under each condition, and at least one probe demonstrates a statistically significant difference (or convincing null) for a real app's real toggle.
