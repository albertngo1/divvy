## Overview
Cone is a tiny menubar/tray app (and headless daemon) that continuously classifies your home network's NAT type via STUN and alerts you the moment it degrades — especially the dreaded silent shift to **CGNAT / symmetric NAT** that breaks inbound port forwards, self-hosted services, and P2P/hole-punching. For self-hosters, homelabbers, and anyone running services from a residential connection.

## Problem
ISPs quietly migrate customers behind Carrier-Grade NAT or flip you to symmetric NAT without notice. Suddenly your reverse-proxied services, game servers, or WireGuard endpoint are unreachable from outside — and you find out hours later from a confused user, not a monitor. NatTypeTester exists as a one-shot manual check; nobody's making it a continuous, alerting sentinel that tells you *the moment it changed* and roughly *when*.

## How it works
Cone runs a lightweight loop: every N minutes it performs a full RFC 5780-style STUN probe against a pool of public STUN servers, classifies the result (open / full-cone / restricted / port-restricted / symmetric / CGNAT-suspected / blocked), and tracks your observed public IP. The menubar icon color-codes current status. On any *degradation transition* (e.g. full-cone → symmetric, or public IP now in 100.64/10 CGNAT space), it fires a desktop notification plus optional webhook/ntfy push. It keeps a rolling timeline so you can see 'symmetric since 3:12am' and correlate with an ISP reboot. Optional: probe your own advertised port to confirm reachability end-to-end.

## Technical approach
Stack: Go (single static binary, cross-platform tray via systray) or a Tauri shell for richer UI. STUN via `pion/stun`; multi-server probing to avoid one bad server skewing classification. CGNAT heuristic: public IP inside 100.64.0.0/10, or STUN-reported external IP differing from a second-source public IP lookup. State stored in a small SQLite ring buffer: `probe(ts, stun_server, nat_class, ext_ip, mapped_port)`. Alerts via native notifications + configurable ntfy/webhook (fits Albert's ntfy setup). Hard part: reliable, low-flap classification — STUN results are noisy, so transitions need debouncing (N consecutive agreeing probes) before alerting.

## v1 scope
- macOS menubar app, single STUN pool, 5-min interval.
- Four states: open / cone / symmetric / CGNAT-suspected.
- Desktop notification on degradation + a 24h status list.

## Out of scope
- End-to-end port reachability test, Windows/Linux tray, historical graphs, auto-remediation.

## Risks & unknowns
- STUN classification is inherently fuzzy; false alarms erode trust — debounce carefully.
- Public STUN servers rate-limit or disappear; needs a resilient pool.
- CGNAT detection has edge cases (double-NAT, VPN interfaces like Tailscale skewing IPs).

## Done means
With Cone running, manually forcing a symmetric/CGNAT condition (e.g. via a test STUN endpoint or double-NAT) produces a debounced degradation alert within two probe cycles and logs the transition timestamp — and normal full-cone operation produces zero false alarms over a 24-hour run.
