## Overview
A paid on-site assessment (sold as a white-label service to MSPs, and direct to manufacturers, clinics, and design shops) that answers one question no SBOM answers: *what stops working when your software vendor stops existing?* Deliverable is a 12-page report plus a recorded blackout drill.

## Problem
SMBs run a dozen desktop apps — CAM post-processors, dental imaging, HVAC load-calc, veterinary PMS, encoded PHP portals — that silently check a license server on startup. Vendors get acquired, sunset, or just let a domain lapse. The failure is not gradual: a cert expires on a Tuesday and the shop floor stops. Nobody can say in advance which apps hard-fail versus which run offline forever, because nobody has ever tried. Legacy-app inventory tools list *what is installed*; they do not list *what it needs from the internet to boot*.

## How it works
1. **Listen (14 days).** A small box becomes the LAN's DNS forwarder and taps a mirror port. Every FQDN, every TLS SNI, mapped back to the host and — on Windows — the process.
2. **Enrich.** Each destination domain is scored for vendor mortality: RDAP registrar + expiry, crt.sh issuance cadence (a cert that stopped rotating is a dying service), MX presence, Wayback last-meaningful-change, plus a hand-curated registry of vertical-software vendors and their acquisition status.
3. **Drill.** At a scheduled off-hours window, the box null-routes the vendor set via DNS RPZ + firewall drop while a technician walks a 10-step checklist per app: launch, save, print, license refresh. Everything is timestamped.
4. **Extend.** Grace periods are measured, not guessed: repeat the drill at 1h, 24h, 7d to find the exact offline TTL each app tolerates.
5. **Report.** Per app: FAILS CLOSED / DEGRADES / FAILS OPEN, offline TTL, the exact endpoint, and a mitigation (local license cache, DNS pin + self-signed CA, snapshot the VM, escrow demand at renewal).

## Technical approach
Go + gopacket for SNI/QUIC-SNI extraction; Unbound with query logging as the DHCP-pushed resolver; Sysmon Event ID 3 shipped from Windows endpoints for process→flow attribution; SQLite for the flow/endpoint model (`host, process, fqdn, first_seen, bytes, tls_ja4`); RPZ zone generated from the drill's selected FQDN set. Enrichment hits RDAP, crt.sh, and the Wayback CDX API. The hard part is attribution: on a machine without Sysmon you only have IP+SNI, and shared CDNs collapse ten vendors into one Cloudflare IP — so JA4 fingerprints plus per-host temporal correlation (app launch → burst within 3s) do the disambiguation.

## v1 scope
- One site, one Linux box, manual install.
- Unbound log + Sysmon only. No mirror-port capture yet.
- Vendor registry hand-seeded with 40 verticals.
- Drill is a human with a checklist and a stopwatch.
- Report rendered from a Markdown template.

## Out of scope
Continuous monitoring, cloud SaaS dashboard, remediation-as-a-service, automated license-cache patching (legally hairy).

## Risks & unknowns
Blacking out a live network is scary — needs a signed drill window and a one-command rollback. MSPs may want to resell rather than buy. Vendor-mortality scoring will produce false alarms on healthy small vendors.

## Done means
One paying pilot site where the drill produced at least one surprise: an app the owner *believed* was offline-capable that failed closed, with the timestamped log to prove it.
