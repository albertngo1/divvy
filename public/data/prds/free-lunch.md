## Overview
Free Lunch is a self-hostable prober that takes a public free-proxy subscription URL (the VMess/VLESS/Trojan/Hysteria2 base64 blobs that circulate on GitHub and Telegram) and, for every node in it, answers one question: *is this exit tampering with my traffic?* Output is a scored table and a filtered subscription file containing only the nodes that behaved.

## Problem
These lists have real users with real stakes — people in censored networks who copy-paste an endpoint and immediately log into email over it. A free exit node is an operating cost someone chose to pay, and the plausible business models are ads-injection, credential harvesting, and traffic collection. Meanwhile the community's only quality signal is *does it connect* and *how fast*. Latency is measured obsessively; integrity is measured never.

## How it works
You run a tiny **canary origin** on a host you control (a $5 VPS, or your homelab behind Tailscale) serving known-byte responses over HTTPS, plus an authoritative DNS zone you own. Then for each proxy node the prober runs a fixed battery through it:
1. **TLS integrity** — fetch the canary over HTTPS, compare the presented leaf cert SPKI against the pinned fingerprint. Mismatch = interception, full stop.
2. **Plaintext injection** — fetch a known-hash HTTP page; byte-diff. Any delta is injection; report the diff.
3. **DNS honesty** — resolve `<nonce>.canary.example` and a control set (a known-blocked domain, an NXDOMAIN, a wildcard); compare against ground truth from your own authoritative server, which also *logs which resolver IP asked* — this reveals the exit's real upstream resolver and whether it answers without ever querying you (i.e. it's lying).
4. **Egress identity** — the canary records the source IP, ASN, rDNS, and whether the exit adds `X-Forwarded-For`/`Via`.
5. **Correlation** — nonce in the request path proves the fetch reached your origin; nodes sharing an egress IP or cert fingerprint get grouped into likely single-operator clusters.
Each node gets a letter grade with the evidence attached, and clusters get named so a whole fleet fails together.

## Technical approach
Go, because the proxy clients matter: shell out to `xray-core`/`sing-box` in a per-node ephemeral config on a local SOCKS port, drive probes through it with a `net/http` client using a custom `DialContext` and `VerifyPeerCertificate` (never `InsecureSkipVerify` — capture the chain and judge it yourself). Concurrency-limited worker pool, hard timeouts, results into SQLite (`node`, `probe_run`, `finding`, `cluster`). Canary origin is 60 lines of Go + a CoreDNS zone. Hardest part: **attribution**. A failure can come from the exit, the censor between you and it, or the destination. Solve it by always running the identical battery over a direct connection and a known-good control proxy in the same run, and only reporting a finding when the node disagrees with both.

## v1 scope
- One subscription URL in, VMess + VLESS only
- Three probes: cert pinning, HTTP byte-diff, DNS-vs-authoritative
- `freelunch scan --sub <url>` prints a table; `--emit-clean` writes a filtered subscription
- Canary origin as a single binary you deploy yourself

## Out of scope
Speed benchmarking, a hosted public leaderboard, deanonymizing operators, anything that stresses a node beyond a handful of small requests.

## Risks & unknowns
Nodes churn every 15 minutes, so results are perishable — treat scores as per-run, not reputation. Be a polite client: a few KB per node, rate-limited, no repeat hammering. Legal/ethical care around publishing operator-identifying conclusions; ship findings as evidence, not accusations.

## Done means
Pointed at a live public list, it flags at least one node whose leaf certificate for your canary domain does not match your pinned SPKI, prints the offending chain, and emits a clean subscription that excludes it.
