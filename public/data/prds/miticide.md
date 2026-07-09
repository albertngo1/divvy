## Overview
Miticide is a small self-hosted daemon for homelabbers and hobby-server operators. It watches running processes and kills *parasites* — cryptominers, adware, hijacked npm postinstall scripts, obfuscated CDN loaders — while sparing the host's real workload, even when both peg the same core. The name and design metaphor come straight from the varroa-mite spider-venom paper: a toxin selective enough to kill the parasite in a shared body without hurting the host.

## Problem
Generic resource killers (OOM killer, cgroup limits, `cpulimit`) are blunt: they can't tell a legitimate 100% CPU ffmpeg transcode from a stealth miner. Operators either over-provision, get surprised by a compromised dependency (see the obfuscated Akamai bash script), or nuke their own jobs. There's no lightweight tool that reasons about *intent* the way the spider venom targets a *species*.

## How it works
Miticide builds a behavioral fingerprint per process: CPU duty-cycle shape, outbound connections (matched against pool/stratum ports and blocklists like eth-phishing-detect's domain set), parent lineage (spawned by a package manager postinstall? a browser?), on-disk provenance (deleted binary, /tmp, world-writable), and syscall texture via eBPF. Each signal contributes to a "parasite score." Above threshold, it SIGSTOPs first (quarantine — like the sublethal dose), notifies via ntfy, and SIGKILLs only if you don't whitelist within N minutes. The host's tagged workloads carry a signed "host marker" (a cgroup label + env var) that grants immunity — the bee pheromone.

## Technical approach
Rust or Go daemon. Process enumeration via `/proc`; network via `ss`/conntrack netlink; optional eBPF (libbpf-rs / cilium/ebpf) for syscall histograms and exec tracing. Blocklists pulled from MetaMask/eth-phishing-detect and known-miner pool lists, refreshed daily. Scoring is a transparent weighted rule engine (no ML in v1) with a YAML policy file. Quarantine = cgroup freezer. Notifications via ntfy HTTP. The genuinely hard part: keeping false positives near zero — a Handbrake encode and a Monero miner look identical on CPU alone, so the discriminator must lean on provenance + network, not load.

## v1 scope
- Poll `/proc` every 5s, compute parasite score from CPU + network + provenance only (no eBPF)
- Match outbound IPs/domains against a bundled miner/phishing blocklist
- SIGSTOP + ntfy alert with a one-click whitelist link
- YAML allowlist by binary hash / cgroup label

## Out of scope
- eBPF syscall profiling (v2)
- Container-escape detection, rootkit hunting
- Any ML classifier

## Risks & unknowns
- False positives killing legit jobs = instant uninstall; quarantine-before-kill mitigates
- Sophisticated miners mimic host markers — signing the marker helps but isn't bulletproof
- eBPF portability across kernels

## Done means
On a test box running a real xmrig alongside an ffmpeg transcode, Miticide freezes only xmrig within 15s, fires an ntfy alert, leaves the transcode untouched across a 10-minute run, and honors a whitelist entry on restart.
