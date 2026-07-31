## Overview
First Boot is a single-purpose capture rig plus a public corpus. You put a brand-new device (TV stick, IP camera, smart plug, cheap tablet) behind a Raspberry Pi that is its only path to the internet, power it on, and *do not touch it* for ten minutes. Out comes `birth-certificate.json`: everything the device said to the internet before any human consented to anything. For buyers, tinkerers, and journalists who want an answer to "is this $25 box malware?" that isn't a vibe.

## Problem
Cheap consumer hardware routinely phones home the instant it gets a DHCP lease — telemetry, hardcoded DNS, sometimes an outright C2 check-in. The evidence exists for exactly ten minutes and then drowns in normal traffic forever. Nobody captures it, so every buyer re-discovers it alone, and reviews never cover it. There is no lookup table for "what does this model do out of the box."

## How it works
Pi 5, two interfaces: onboard eth is the uplink, a USB NIC (or `hostapd` AP on wlan0) is the device's only network. `dnsmasq` serves DHCP+DNS, `nftables` NATs, `tcpdump` records everything to pcap. You press a physical button the first time you touch the device's remote — that stamps a `first_user_interaction` marker, splitting the timeline into *unconsented* and *consented* halves.

A Rust post-processor (`pcap` + `tls-parser` + `trust-dns-proto`) folds the capture into an ordered timeline: each first contact gets `{t_ms, sni, resolved_ip, asn, ja4_client, bytes, before_consent}`. It flags the loud stuff automatically: UDP/53 or DoT/DoH to an address that isn't the DHCP-advertised resolver (hardcoded DNS bypass), NTP to a vendor host, and cleartext HTTP bodies matching identifier patterns (IMEI, MAC, serial, Android ID) — which are extracted, hashed, then **redacted** before anything is written to the shareable artifact.

Certificates get submitted as PRs to a corpus repo keyed `brand/model/firmware/`, schema-validated in CI. The site renders a scorecard (contacts-before-consent, distinct non-vendor ASNs, hardcoded DNS y/n, cleartext identifiers y/n) and a diff view between firmware revisions. Each certificate also renders a deterministic 12-arm radial SVG sigil, hashed from the sorted `(domain, ja4, bucketed_t)` set — so two units of the "same" model shipping different firmware look visibly different in a thumbnail grid, before you read a byte.

## Technical approach
Stack: Raspberry Pi OS, hostapd/dnsmasq/nftables, tcpdump, Rust for parsing, JSON Schema for the corpus, an Astro static site for rendering. Signing via `minisign` over the canonicalized JSON so the capture host is attributable.

The genuinely hard part is **comparability**. The same stick behaves differently by geo, uplink ASN, and date; CDN IPs churn hourly. So the schema records capture locale/uplink-ASN/timestamp, and the diff engine compares on `(sni, dest_asn, ja4)` tuples — never raw IPs — with a tolerance for ordering jitter inside 500ms buckets. Getting `t=0` right also matters: capture must be live before the device draws power, so the rig arms first and you switch the *outlet*, not the Pi.

## v1 scope
- One shell script that arms capture and one binary that emits JSON + Markdown
- Timeline, SNI, ASN lookup, JA4, before/after-consent split
- Hardcoded-DNS flag and identifier redaction
- Sigil SVG generator
- Corpus is literally a folder of JSON files in a git repo, no website

## Out of scope
- TLS interception / MITM CA installation
- Long-term monitoring after the first ten minutes
- Mobile app, hosted service, automated purchasing advice

## Risks & unknowns
- Legal/ethical line: capturing your own device on your own network is fine; publishing a serial or IMEI is not — redaction must be default-on and tested, not a flag.
- Vendors could geofence or delay first check-in past the capture window.
- Corpus only has value with contributors; may stay a corpus of one.

## Done means
Run the rig against a cheap Android TV stick and produce a signed certificate showing at least one domain contacted before any user interaction, with correct ASN attribution; re-run on a second unit of the same model and get a matching sigil, then flash different firmware and get a visibly different one.
