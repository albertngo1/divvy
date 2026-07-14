## Overview
Interceptor is a SaaS + mobile app for grease-hauling companies and multi-location restaurant groups that manages grease-interceptor (FOG — fats, oils, grease) pump-out compliance end to end. Buyers: small-to-mid liquid-waste haulers (10–200 accounts) and restaurant chains who currently juggle this in spreadsheets and paper manifests.

## Problem
Every commercial kitchen has a grease interceptor that must be pumped on a municipality-set cadence (often every 30/60/90 days, or by the '25% rule'). The hauler pumps it, hand-writes a manifest, and someone is supposed to file it with the city's FOG program. In practice: due dates are tracked on a whiteboard, manifests get lost, and restaurants eat surprise fines or shutdowns when a trap overflows or an audit finds no records. Haulers lose accounts because they can't prove service history.

## How it works
1. Onboard each trap: capacity (gal), municipality, required cadence, GPS location, access notes.
2. Interceptor computes next-due dates and clusters due traps into geographic route-days.
3. Driver app: arrive → geofence check-in → photo of open trap → gallons pumped → digital signature. A compliant PDF manifest auto-generates.
4. Manifest is emailed to the restaurant and (where a portal/API exists) filed to the municipal FOG program; otherwise queued as a pre-filled submission.
5. Dashboard flags overdue traps in red before they become fines.

## Technical approach
Stack: Next.js + Postgres (PostGIS for trap geolocation and route clustering), a React Native driver app, S3 for photos. Data model: `haulers`, `sites`, `interceptors` (capacity, cadence_rule, municipality_id), `service_events` (gallons, photos, gps, signature), `manifests`. Route optimization: greedy nearest-neighbor over PostGIS `<->` distance seeded by due-date urgency, good enough for <30 stops/day. Manifests rendered server-side (React-PDF). The genuinely hard part is the long tail of municipal FOG programs — each has its own form fields, cadence rules, and submission channel (email, PDF upload, proprietary portal). Model these as a versioned per-municipality JSON ruleset + submission-adapter, seeded from the largest metros first.

## v1 scope
- Trap registry with cadence + next-due computation
- Driver check-in flow (geofence, photo, gallons, signature)
- Auto-generated PDF manifest emailed to site
- Overdue dashboard for the hauler
- 3 seeded municipality rulesets

## Out of scope
- Automated portal submission (start with pre-filled PDF + email)
- Billing/invoicing integration
- Sample/lab (grease concentration) tracking

## Risks & unknowns
- Municipal submission fragmentation may resist automation — v1 leans on manifest generation, not filing.
- Haulers are low-tech; driver UX must survive a greasy glove and no signal (offline queue).
- Sales motion: do haulers or restaurants pay? Lead with haulers (they feel the account-retention pain).

## Done means
A hauler onboards 20 traps, the app produces a correct next-due schedule, a driver completes a real check-in offline that syncs a signed PDF manifest to the restaurant, and the overdue dashboard correctly flags a trap past its cadence.
