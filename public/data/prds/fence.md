## Overview
Fence is a self-hosted idle/tycoon game for the privacy-curious homelabber. It skins your household's actual outbound network chatter as a data-brokerage empire: each phones-home connection is an 'asset', each destination a 'buyer'. You play the villain — but the leaderboard of who's leaking what is 100% real.

## Problem
The 'check on your smart appliances' and Windows-GDID threads keep proving the same thing: people have no felt sense of how much their TVs, doorbells, and laptops exfiltrate. Static privacy dashboards are boring and get closed. A tycoon loop makes you *want* to watch the numbers climb — and then recoil.

## How it works
Each device on your network becomes a little tycoon 'earner' with a portrait and a creepy title ('Living Room TV — Senior Behavioral Analyst'). Real observed outbound flows generate in-game 'data coins' scaled by volume and destination reputation (ad-tech domain = premium buyer; NTP server = worthless). You spend coins to 'upgrade' earners — which just unlocks deeper real detail (which domains, how often, payload sizes). A running ticker shows your empire's 'valuation'. The twist: a red 'Shut It Down' button next to any earner writes a real pi-hole/pf blocklist rule, tanking your score but actually plugging the leak. Winning the game means bankrupting yourself.

## Technical approach
Stack: Go daemon on the Mac mini homelab. Data sources: Pi-hole/Unbound DNS query logs (`pihole-FTL` API or the SQLite `pihole-FTL.db`), plus optional passive flow capture via `pcap`/`zeek` for byte counts. MAC→device mapping via the DHCP lease table and a bundled OUI vendor DB. Destination reputation from a shipped list joining the Disconnect/EasyPrivacy tracker domains + a heuristic (ASN owner). Frontend: a single htmx/Canvas page rendering earners as animated tiles. 'Shut It Down' generates a pi-hole regex block or writes to a `pf` anchor. Hard part: attribution — mapping a raw flow to a *device* and a *human-meaningful buyer* without false 'this fridge is spying' alarms; needs a conservative reputation model and an 'unknown/benign' bucket so it's honest, not clickbait.

## v1 scope
- Ingest Pi-hole DNS logs only (no pcap yet)
- Map devices via DHCP leases + OUI vendors
- Score coins per query against a shipped tracker-domain list
- One Canvas page: device tiles, valuation ticker, per-device top-10 domains
- 'Shut It Down' writes a real pi-hole block and shows score drop

## Out of scope
- Deep-packet payload inspection, TLS SNI parsing
- Multi-household leaderboards
- Mobile app

## Risks & unknowns
- Encrypted DNS (DoH) from smart TVs bypasses Pi-hole → undercounts; note it in-game honestly
- Turning surveillance into 'fun points' could feel gross; the bankrupt-to-win framing must land
- Reputation false positives eroding trust

## Done means
Pointed at Albert's Pi-hole, Fence renders every LAN device as an earner with a real valuation, and clicking 'Shut It Down' on the smart TV both drops the score and adds a working block rule verified by a subsequent blocked query in the logs.
