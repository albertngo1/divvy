## Overview
Nielsen is a self-hosted tool that passively watches your smart TV watch you. Modern TVs use ACR (automatic content recognition) — they fingerprint frames of whatever's on screen, even from HDMI inputs and game consoles, and upload it to ad brokers. Nielsen intercepts that telemetry on your LAN and reconstructs the deadpan viewing dossier the TV is compiling, named after the ratings company whose job your TV secretly does for free. For homelabbers and the privacy-curious.

## Problem
The Lobsters post 'you should probably check on your smart appliances' is right, but 'check' is vague and the tooling is Wireshark-grade. People know the TV spies; nobody can *see* what it actually sends. Nielsen makes the surveillance legible and a little funny, then hands you the block button.

## How it works
You point Nielsen at your TV (static DHCP lease or MAC). It logs every DNS query and connection the TV makes, classifying destinations against a curated list of ACR/telemetry endpoints (Samba TV, Vizio Inscape, LG, Roku, etc.). It correlates upload frequency and payload-size bursts with your watch sessions to build a timeline: 'idle', 'watching (heavy ACR uploads)', 'HDMI input active'. Where the ACR vendor exposes nothing decodable, Nielsen infers behavior from traffic shape alone. The output is a scrollable dossier — 'Subject watched something at 21:14 for 47 min; TV phoned home 320 times' — plus a one-click 'Cut the line' that writes a Pi-hole / firewall block rule for that endpoint and shows you what breaks (usually nothing).

## Technical approach
Runs in Docker on the homelab. Two capture modes: (1) DNS-only via Pi-hole query log ingestion (easy, no MITM), (2) optional full flow metadata via a span port / pcap with per-flow byte counts (no payload decryption — TLS stays sealed; we read *volume and cadence*, not content). Data model: Event { ts, dst, category, bytes }, Session { start, end, uploadCount, inferredState }. Classification uses a versioned endpoint-reputation JSON pack. Correlation is a simple burst-detector over upload bytes vs. a quiet baseline. Frontend: a static timeline (D3) + dossier cards. The hard part is honest inference: distinguishing ACR uploads from firmware/EPG chatter without decrypting anything, so the dossier is suggestive but not fabricated.

## v1 scope
- Ingest Pi-hole DNS logs for one device
- Classify against a hand-built ACR/telemetry endpoint list
- Daily timeline of contacts + a per-day 'dossier' summary card
- One-click block-rule generation (writes a Pi-hole regex)

## Out of scope
- Decrypting or reconstructing actual recognized content
- Multi-TV fleets, phones, doorbells (later)
- Automatic firmware or vendor identification

## Risks & unknowns
- Endpoint list rots as vendors rotate domains
- Traffic-shape inference can over-claim; must label confidence, not assert
- Requires DNS visibility (Pi-hole) or a managed switch for the deluxe mode

## Done means
With my TV on the network, Nielsen shows a day timeline where my actual evening viewing session lights up as a burst of classified ACR contacts, produces a readable dossier card for that session, and the 'Cut the line' button writes a working Pi-hole rule that stops the uploads without breaking playback.
