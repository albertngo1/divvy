## Overview
Exit Node is a CI-integrated SaaS that scans mobile and connected-TV app bundles for embedded **proxyware** — SDKs that quietly resell users' bandwidth as residential-proxy exit nodes. It's for app publishers, CTV/tvOS studios, and the ad-mediation shops who bolt monetization SDKs into other people's apps.

## Problem
The "get paid $0.30/MAU to embed our SDK" schemes (Bright Data/Luminati, IPRoyal Pawns, Infatica, PacketStream, ProxyRack) ride into apps through third-party monetization or analytics SDKs, often without the publisher realizing it. Now LG is banning residential proxies from Smart TV apps, and Google/Apple reject on it too. A publisher can lose a whole platform overnight for a dependency they didn't audit. There is no easy 'is my app secretly a proxy node?' check.

## How it works
1. Upload a build (or point at a CI artifact / TestFlight / Play internal track).
2. Exit Node unpacks it, enumerates native libs, bundled SDKs, and manifest permissions.
3. It matches against a curated **proxyware fingerprint DB**: known package names, class signatures, native lib hashes, endpoint domains, and TLS SNI patterns.
4. It runs the build in an instrumented emulator, watches for tell-tale behavior (persistent outbound tunnels, SOCKS relaying, remote-config beacons to proxy control planes).
5. Output: a red/green report with the exact SDK, the transitive dependency path that pulled it in, and a copy-paste removal / gradle-exclude snippet, plus a signed PDF attestation to hand app reviewers.

## Technical approach
Stack: Go + Python workers. Static: apktool/jadx for Android, `otool`/class-dump for iOS/tvOS, extract native `.so`/Mach-O and hash. Dynamic: Frida-instrumented Android emulator + mitmproxy to capture SNI/endpoints. Fingerprint DB seeded from public proxyware repos, MetaMask/eth-phishing-style community blocklists, and destroylist-style curated domain feeds, versioned as signed JSON packs. Data model: `bundle → components[] → verdict`, each component carrying evidence blobs. The genuinely hard part is low false-positives: legit VPN/CDN/WebRTC SDKs look network-shady, so verdicts need behavioral corroboration, not just a name match.

## v1 scope
- Android APK/AAB only.
- Static signature match against ~40 known proxyware SDKs.
- Web upload + single PDF report.
- No emulator/dynamic pass yet.

## Out of scope
- iOS/tvOS (v2), continuous monitoring, IDE plugin, auto-PR removal.

## Risks & unknowns
- Obfuscated/renamed SDKs evade signature match — needs behavioral net.
- Fingerprint DB is a maintenance treadmill; freshness is the moat and the cost.
- Legal: naming vendors as proxyware invites disputes.

## Done means
Given a test APK with IPRoyal Pawns embedded via a transitive dependency, Exit Node reports the SDK, the exact dependency path, and a working gradle exclusion — and reports clean on a control APK that only bundles a legitimate ad SDK.
