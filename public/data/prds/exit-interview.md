## Overview
Exit Interview is a self-hosted scanner and public grade card for free public proxy nodes — the SS/VMess/VLESS/Trojan/Hysteria2 subscription links passed around GitHub repos and Telegram channels. For people who actually rely on these (users behind censorship, travelers) and for researchers who want evidence rather than vibes about which ones are traps.

## Problem
Existing checkers for these lists measure exactly one thing: does it connect, and how fast. That is the least interesting property. A free exit costs the operator real bandwidth, so a fraction of them are monetizing it — terminating TLS, hijacking DNS, injecting into plaintext, harvesting credentials, or reselling the connection as "residential proxy" bandwidth. Users copy-paste a subscription URL with no way to tell a volunteer from a wiretap.

## How it works
Parse a subscription URL into node records, then for each node bring up an isolated client and run a canary battery against infrastructure you control — never anyone else's traffic:
- **TLS re-origination (the killer test):** your canary server logs the JA4 fingerprint of the ClientHello it actually receives. If it doesn't match what the scanner sent, the exit terminated and re-originated the connection. That is unambiguous MITM, independent of whether the cert chain looks valid.
- **Cert pinning:** compare leaf SPKI against a known pin; also request a deliberately-invalid-cert host and see if the node "helpfully" fixes it.
- **DNS nonce replay:** resolve `<nonce>.probe.yourzone` against your own authoritative nameserver. You learn the real resolver IP and ECS — and if that unique nonce is ever queried again from a different IP, the exit is logging and replaying lookups. Smoking gun, delayed by hours.
- **Plaintext injection:** byte-diff a known HTTP page; check for `Via`/`X-Forwarded-For` leaking the client IP.
- **Exit identity:** IP → ASN via Team Cymru whois; consumer/mobile ASNs flag proxyware-harvested bandwidth rather than a hosted volunteer node.
- **Credential canary:** post a unique fake login to your own endpoint; any later reuse is attributed back to the node.

## Technical approach
Go orchestrator driving Xray-core, one node per container with `--network=none` plus an explicit egress veth (a node may be a honeypot that attacks the client, so the scanner must never share the host netns). Canary server is a small Go TLS listener parsing raw ClientHello for JA4, behind a CoreDNS instance authoritative for the probe zone. Postgres: `node(id, proto, host, port, source_list, first_seen)`, `scan(node_id, ts, checks jsonb)`, `replay_event(nonce, seen_ip, ts)`. Grades are weighted per check into A–F. The hard part is attribution over churn: these lists rotate every 15 minutes, so a per-node grade is nearly worthless — you have to cluster by exit IP, ASN, TLS fingerprint, and cert chain to grade the *operator*, and that clustering is the actual product.

## v1 scope
- One hardcoded subscription list, VMess + Shadowsocks only.
- Three checks: cert pin, JA4 mismatch, DNS nonce logging.
- CLI printing one grade line per node.
- No web scoreboard, no replay tracking beyond a table dump.

## Out of scope
Speed/latency ranking, a GUI client, and publishing a curated "safe list" — recommending a node carries liability you don't want in v1.

## Risks & unknowns
Node churn may outpace scanning entirely. Some source lists forbid automated use. A clean scan is not a safety guarantee and must be worded so no one treats it as one. Unclear how common re-origination actually is — the whole project could find that 98% of nodes are boringly honest, which is itself a publishable result.

## Done means
Running against a live subscription produces a per-node grade card, and a node you deliberately stand up as a MITM with a valid cert is correctly graded F by the JA4 check alone.
