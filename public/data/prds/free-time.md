## Overview

A phone app plus claim generator for owner-operator truck drivers and 1–20 truck fleets. It watches when you arrive at and leave a shipper/receiver, computes billable detention against the terms in *that specific load's* rate confirmation, and emits a PDF evidence packet a broker's AP clerk can't casually deny.

## Problem

Detention (getting held past the 2 free hours) is billed at $50–$100/hr and is quietly the largest uncollected revenue line in small trucking. Claims die for two reasons, neither of which is "the driver didn't wait":

1. **No proof of arrival.** Drivers screenshot Google Maps Timeline or hand-write times on a BOL. Brokers reject it.
2. **Missed notification clause.** Most rate cons require you to notify dispatch/broker *while still on site*, within N minutes of the free-time expiring. Drivers are asleep in the bunk at hour 2:05. The claim is dead before it exists.

Everything on the market is a fleet-telematics platform sold to carriers with 200+ trucks. Nobody sells the *evidence artifact*.

## How it works

1. Driver photographs the rate confirmation. An LLM extracts structured terms: free hours, detention rate, cap, notification window, notification channel, accessorial code.
2. Driver taps the load; app registers a geofence around the facility (OSM polygon if it exists, else a 250m circle the driver drags).
3. Background location logs enter/exit with GPS accuracy and a periodic sample trail. Arrival timestamp = first sustained in-fence sample.
4. At **free_hours − 15 min**, the phone alarms: "Detention starts at 14:32. Send this text now." One tap sends the pre-written notification via SMS/email and logs the send receipt.
5. On exit, it generates `claim-<load>.pdf`: computed hours, GPS trail map, both timestamps, the notification receipt with delivery timestamp, the quoted rate-con clause, and the invoice line.

## Technical approach

- **Client:** Expo / React Native. `expo-location` geofencing (iOS `CLCircularRegion` + significant-location fallback; Android foreground service). Store raw samples in SQLite, never overwrite.
- **Rate con parsing:** PDF/photo → Claude with a strict JSON schema (`{free_hours, rate_per_hour, cap_per_day, notify_within_min, notify_channel, accessorial_code}`), confidence per field, driver confirms anything below threshold. Cache per-broker templates — the same broker's rate con is byte-similar every time, so template hit rate climbs fast.
- **Evidence integrity:** each location sample and notification receipt is appended to a per-load hash chain (SHA-256 over prior hash + payload), sealed at exit. Not a blockchain — just a tamper-evident log so "he edited the times" is answerable.
- **Data model:** `Load` → `Stop` (facility geom, arrive_ts, depart_ts, samples[]) → `Notification` (channel, body, sent_ts, receipt) → `Claim`.
- **Hard part:** iOS background location is *unreliable and aggressive about suspension*. Geofence exit can fire 10 minutes late at a warehouse with bad sky view. Mitigation: dual signal (geofence event + speed-threshold heuristic on the sample trail), and always show the driver the computed times with a manual correction that is logged as a correction, not a silent overwrite.

## v1 scope

- One driver, one active load at a time
- Manual "I arrived" / "I left" buttons as first-class, geofence as assist
- Rate-con parsing for **one** broker's layout, hardcoded fallback form
- Notification = pre-filled SMS via the system share sheet (no server sending)
- PDF export to Files/email. No portal, no accounting integration

## Out of scope

ELD integration, fleet dashboards, factoring/invoicing, broker API submission, layover and TONU claims, driver payroll.

## Risks & unknowns

- Background location battery drain kills adoption if it exceeds ~4%/hr.
- Brokers may simply ignore better evidence; needs 5 real collected claims to validate.
- Rate-con extraction errors that *under*-claim are invisible failures.

## Done means

A driver sits at a receiver for 4h20m, gets the 15-minute alarm, taps once to send notification, and on departure has a PDF listing 2h20m detention at the rate-con's own quoted rate — and one real broker pays it.
