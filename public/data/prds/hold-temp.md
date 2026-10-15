> **Spotted in the news:** The SLO Tribune on PG&E's power-shutoff prep, NBC Boston's 'town-wide' Concord outage, and KSNB's Central City outage that closed several businesses.

## Overview
Off-grid temperature logging plus a decision and claims report for small food businesses (restaurants, bodegas, small grocers, daycare kitchens) that lose power. The product is the evidence trail, not the sensor.

## Problem
Public Safety Power Shutoffs in California, plus storm and grid outages everywhere else (Concord MA and Central City NE this week alone), hit food businesses several times a year. The FDA Food Code says TCS foods held above 41°F for more than 4 hours must be discarded. Without a log, operators guess. Some throw away $3–8k of inventory they could have kept. Others keep food they shouldn't and risk illness or a citation. Afterward, food-spoilage riders on business owner's policies (often $5–25k) and some utility claim processes ask for documentation the owner doesn't have. Commercial wireless sensor systems (SmartSense, ComplianceMate) cost hundreds per month and depend on Wi-Fi, which is down during the outage.

## How it works
1. Stick a coin-cell BLE logger in each cooler and freezer, labeled 'Walk-in 1', 'Reach-in bar', and so on. It logs every 5 minutes and keeps 60 days on the device, with no network needed.
2. When power returns, open the phone app and it syncs all loggers over Bluetooth.
3. The app finds the outage window and computes time above 41°F for each unit (0°F for freezers). It then marks each unit KEEP, DISCARD or CHECK (thawed but still has ice crystals).
4. The owner photographs the discarded items. The app lets them price the items from recent invoices.
5. It exports a one-page health-department log per unit plus a claim packet: temperature curves, outage timestamps matched to the utility's outage map, photos, and an itemized loss.

## Technical approach
Use off-the-shelf BLE loggers (e.g. Inkbird or SwitchBot-class devices with documented protocols) rather than custom hardware in v1. The app is React Native with a BLE plugin. Outage timestamps can be cross-checked against PG&E's PSPS event data and utility outage-map scrapes where they exist. Data model: Site → Unit → Reading(ts, °C) → Event(outage) → Determination(rule, minutes_over, verdict) → LossItem. The hard part is making the determination defensible. That means encoding the Food Code rules exactly (cumulative vs. continuous time, cooling-down exceptions, the frozen-food ice-crystal rule) and producing a report that both a county EH inspector and an insurance adjuster accept.

## v1 scope
- One supported logger model
- iOS app: sync, outage detection, verdict per unit
- PDF report: curves + verdicts + signed attestation
- Manual loss itemization with photos

## Out of scope (for now)
- Live alerting over cellular
- Inventory system integrations
- Filing claims on the user's behalf

## Risks & unknowns
Adoption needs pre-installation before the outage, so selling happens right after an outage when the pain is fresh. Who pays: owners, roughly $99 for a 4-pack plus $5/month, or bulk buys by restaurant associations and insurers who want cleaner claims. Adjusters may not accept self-reported data from a cheap device, so tamper-evidence (signed hashes per reading) may be needed. Hardware margins are thin.

## Done means
After a real outage at a pilot restaurant, the report's per-unit verdicts match a county inspector's call, and a spoilage claim filed with the packet is paid without a request for more documentation.
