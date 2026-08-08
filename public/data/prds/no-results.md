## Overview

A subscription compliance service for the ~50,000 US community water systems, the vast majority of which serve under 10,000 people and have no IT staff. Each month it externally verifies that the utility's public IP space exposes no HMI, SCADA, PLC, or remote-access surface, and delivers a signed PDF attestation their state primacy agency, their cyber-insurance underwriter, and their board can all accept. The product is a *negative* finding, professionally documented.

## Problem

After repeated intrusions into small water systems, state primacy agencies, AWIA risk-and-resilience assessments, and insurance renewals all now ask some version of "are your control systems internet-accessible?" The operator of a 3,000-connection system genuinely does not know. Their options are a $15k engineering assessment they can't afford or checking a box and hoping. Meanwhile the actual technical question — "is anything of ours listening on the public internet?" — is cheap to answer if you know how, and worth real money to answer *repeatedly and defensibly*.

## How it works

1. **Onboarding (once):** the utility signs an authorization-to-test and provides their ISP-assigned netblocks, domains, and any static IPs at the plant. We verify ownership via ARIN/RADb registration and a DNS TXT challenge, so we never scan someone else's space.
2. **Monthly sweep:** passive lookup first (Shodan and Censys search APIs over the authorized ranges), then an authorized active check of ICS-relevant ports — 502 Modbus, 20000 DNP3, 44818 EtherNet/IP, 47808 BACnet, 4840 OPC-UA — plus the real-world offenders: 3389 RDP, 5900 VNC, 8080/443 vendor HMIs, and cellular-modem management pages.
3. **Delivery:** a 4-page PDF — scope, method, per-IP findings, and a signed attestation with a scan hash — plus an email that says either "nothing exposed, here's your paperwork" or "one thing appeared this month, here is exactly what and how to close it."
4. **Escalation:** if something *is* exposed, a same-day call and a one-page remediation letter the utility hands to their integrator.

## Technical approach

Stack: Python + FastAPI, Postgres, and a scan worker on a fixed, WHOIS-labeled IP block with reverse DNS reading `scanner.<domain>` and an opt-out page — standard research-scanner hygiene, so we don't look like an attack.

Scanning: `masscan` for discovery at a deliberately slow rate, then `nmap -sV` with the ICS NSE scripts against found ports for banner and protocol confirmation. Passive corroboration via `shodan` and Censys Search v2 APIs, keyed on the authorized CIDRs.

Data model: `utility` → `authorized_scope` (CIDR/domain, proof artifact, expiry) → `scan_run` → `finding` (ip, port, protocol, banner hash, first_seen, last_seen, status). Findings are diffed run-over-run so the PDF can say "unchanged for 7 consecutive months," which is the sentence underwriters actually want.

PDF generation: Typst templates rendered server-side, signed with a per-report Ed25519 signature and a public verification URL.

Prospecting uses EPA SDWIS (public: system name, population served, contact) joined against state primacy-agency lists to build the target list of small systems.

Hardest part is not technical: it is the authorization chain. Scanning municipal infrastructure without airtight, verifiable, current written authorization is the whole business risk. The scope record must be a hard gate in code — a scan that isn't backed by an unexpired, ownership-verified scope simply cannot be dispatched.

## v1 scope

- Manual onboarding for 3 design-partner utilities, paper authorization
- One scan script, one port list, run by hand monthly
- Hand-assembled PDF from a Typst template
- No portal — email delivery only

## Out of scope

- Internal network assessment, pen testing, phishing simulation
- Continuous monitoring or 24/7 SOC
- Remediation work itself (refer to local integrators)

## Risks & unknowns

Municipal procurement is slow and $199/mo may still need a purchase order. Liability: an attestation that misses an exposure is a lawsuit — insurance and careful scope language are mandatory. Many small utilities share a netblock with the whole city, complicating authorization. Sales channel is the real bottleneck; state rural water associations are the likely wedge.

## Done means

Three paying utilities have received two consecutive signed monthly attestations, at least one exposure was found and closed with a documented before/after, and one utility's insurance broker or state agency has accepted the PDF as evidence.
