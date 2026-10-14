> **Spotted in the news:** The FBI and CrowdStrike took down 40+ Texas laptop farms that let North Koreans hold US remote jobs under stolen identities (NYT via Techmeme). Large companies have security teams, but the small firms hiring contractors through job boards have nothing.

## Overview
Desk Check is a cheap, privacy-scoped endpoint check for companies with 5-200 employees that hire remote engineers and ship them laptops. It answers one question continuously: is this laptop being used by the person we hired, at the address they gave us?

## Problem
The FBI/CrowdStrike takedown of 40+ Texas laptop farms shows the pattern. A facilitator receives company laptops at a US address, plugs them into IP-KVMs or remote-access tools, and an overseas operator does the job under a stolen identity. Enterprise companies catch some of this with EDR plus a security operations center. Small startups use only MDM, if they use anything, and find out from the FBI. The costs are payroll paid into sanctioned regimes (OFAC exposure), source-code theft, and sometimes extortion.

## How it works
- A small macOS/Windows agent installed alongside the existing MDM reports a few signals every hour:
  - Wi-Fi BSSID geolocation compared with the address on file
  - USB device IDs that match known IP-KVMs (PiKVM, TinyPilot, JetKVM, cheap HDMI-USB capture boards)
  - Remote-desktop software running (AnyDesk, Chrome Remote Desktop, RustDesk)
  - Input cadence fingerprints, such as keystrokes arriving in perfectly regular bursts
  - The laptop being always on and never moving
- **Consortium signal:** the agent hashes the BSSIDs it sees. If several customers' laptops share a BSSID, that is very likely a farm, and every affected admin gets an alert.

## Technical approach
- Go agent signed for macOS and Windows; Postgres backend.
- **Geolocation:** Apple CoreLocation or the Windows location API where permitted, otherwise a BSSID lookup through a Wi-Fi geolocation API.
- **KVM detection:** a maintained list of USB VID/PIDs and EDID strings.
- **Cross-tenant matching:** salted-hash BSSID sets so tenants never see each other's networks.
- **The hard part:** keeping false positives low without becoming spyware. Nomads, coworking spaces and VPNs all look odd, so alerts need evidence bundles rather than verdicts.

## v1 scope
- macOS only
- Three signals: BSSID geo vs. address on file, KVM/capture USB IDs, remote-desktop processes
- Slack alert with an evidence summary
- Self-serve install through Jamf or Kandji

## Out of scope (for now)
- Identity verification at hire
- Behavioral biometrics
- Linux

## Risks & unknowns
- **Incumbents:** CrowdStrike and SentinelOne may bundle this. The wedge is the price (about $5 per seat per month) and the consortium signal.
- **Legal:** employee-monitoring law (state notice requirements, EU) means employee notice and consent flows are mandatory.
- **Adversary response:** farms will adapt, for example with travel routers and spoofed USB IDs. Detection is a moving target.

## Done means
On a 20-laptop test fleet that includes a staged "farm" setup (a TinyPilot plus 3 laptops on one access point at another address), Desk Check raises an alert for all 3 farm laptops within 2 hours. It produces at most 1 false alert per 50 genuine remote employees per month in a pilot with 3 small companies.
