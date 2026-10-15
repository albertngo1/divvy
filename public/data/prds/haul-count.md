> **Spotted in the news:** Post and Courier's 'As sand mines fuel Charleston's growth, rural Dorchester is saddled with the side effects', plus the Stratford overnight noise complaints. Residents have only anecdotes, and the operator has the data.

## Overview
Haul Count is a cheap roadside sensor kit plus a reporting site for neighbors of sand mines, quarries, landfills and data-center construction sites. A fencepost camera counts heavy trucks by direction and time. The site compares those counts with the operator's permit conditions (hours, trips per day, routes) and exports evidence for county commissions, state mining regulators and DOT.

## Problem
The Post and Courier describes rural Dorchester County taking on the side effects of the sand mines feeding Charleston's growth: truck traffic, dust and broken roads. South Carolina DES mining permits and county conditional-use approvals often cap operating hours or truck routes, but enforcement depends on complaints. At a hearing, a resident who says "it's constant, starting before dawn" goes up against an operator with scale-house records. Paying a traffic engineer for a counting study costs $3k to $8k a week, which residents can't afford, so permits get renewed by default.

## How it works
1. Mount the kit (Raspberry Pi 5 or ESP32-S3 camera, solar panel, LTE or Wi-Fi) facing the haul road.
2. On-device detection classifies vehicles. It keeps only heavy-truck events with timestamp, direction and a thumbnail, and blurs plates by default.
3. The site plots trucks per hour against the permit's allowed window and trip cap, with every violation highlighted.
4. One click exports a PDF with daily totals, per-violation timestamps and photos, plus the device calibration log.

## Technical approach
YOLOv8n or a similar model fine-tuned on dump trucks and semi-trailers runs on-device at 5 fps. Direction comes from line-crossing tracking. Events go over MQTT to a small server running Postgres and Grafana-style charts. Permit conditions are entered by hand from public SC DES or county records. The hard part is counting accuracy at night and in dust, plus surviving outdoor heat. Credibility matters too, so the kit needs a manual-count validation mode where a resident tallies 30 minutes and the device reports its error rate.

## v1 scope
- One hardware build, documented as a parts list
- Heavy-truck counting with direction and hour
- Permit-window overlay entered by hand
- PDF export

## Out of scope (for now)
- Noise and dust (PM2.5) sensors, add-on later
- License-plate reading or attribution to specific companies
- Multi-site regional dashboards

## Risks & unknowns
Operators may challenge accuracy, so the validation log is essential. Some states restrict roadside recording, so the camera must be on private land facing a public road. Revenue is thin: neighborhood groups and environmental-justice nonprofits could pay $200 per kit plus $10 a month. Regulators may still not act on citizen data.

## Done means
One Dorchester-area kit runs for 30 days unattended with at least 90% agreement against three manual counts, and a resident group submits its export into a county or SC DES proceeding.
