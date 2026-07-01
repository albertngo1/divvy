## Overview
Dwell is a phone app for owner-operator truckers and small carriers that automatically proves how long a driver was stuck at a shipper or receiver, then generates the paperwork to bill for that wasted time. It's for the guy who idles four hours at a warehouse dock and never sees a dime because he can't prove it.

## Problem
Freight contracts include "detention pay" — carriers can bill roughly $50-100/hr after the first 1-2 free hours at a dock. But collection is a nightmare: brokers demand signed in/out times, drivers forget to note arrival, dispatchers dispute the numbers, and the proof lives in a smudged bill-of-lading photo. Billions in owed detention evaporates yearly because nobody has clean, timestamped, tamper-evident evidence.

## How it works
Driver enters a load with pickup/drop addresses. Dwell drops a ~150m geofence around each. Crossing the fence auto-logs arrival; leaving logs departure — no button-tapping. The app cross-references the appointment window from the rate confirmation, computes billable detention past the free window, and produces a PDF with a map trail, timestamps, and a GPS-signed audit log. One tap emails it to the broker with the invoice.

## Technical approach
React Native (Expo) with background geofencing via `expo-location` region monitoring (survives app-killed states on both platforms). Local-first SQLite store; each dwell event is hashed (arrival coords+time+deviceID) into a hash-chain so timestamps can't be silently backdated — that chain is the tamper-evidence that makes brokers pay. Rate-con parsing: user photographs the confirmation, OCR via on-device Vision/MLKit, then a small LLM extracts appointment time, detention rate, and free-time terms into a structured record. PDF generation with `react-pdf`. Optional Stripe/QuickBooks export. Hard part is reliable background geofence firing on modern battery-optimized Android and getting the legal framing right so the doc actually holds up in a broker dispute.

## v1 scope
- Manual load entry (address + appointment time + detention rate)
- Auto arrival/departure geofence logging
- Detention math with a configurable free-time window
- One-tap PDF with map trail + hash-chained timestamps
- Email/share sheet export

## Out of scope
- ELD/telematics integration
- Broker-side portal or auto-collection
- Multi-driver fleet dashboard
- Rate-con OCR (v1: type the appointment time)

## Risks & unknowns
- Background geofencing reliability across OS versions is the make-or-break
- GPS drift near huge warehouses could mis-time crossings; may need dwell-confirmation (must stay inside 5+ min)
- Whether a self-generated PDF is persuasive enough without third-party notarization
- Adoption: drivers are busy and skeptical of new apps

## Done means
A driver can create a load, drive to a real address, wait, leave, and receive a correctly-computed detention PDF whose timestamps match reality within 2 minutes — with the geofence firing while the app was backgrounded and the phone screen off the entire time.
