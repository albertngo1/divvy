## Overview
A capture app plus a verification service for people whose job is to prove they were physically somewhere: process servers, municipal code enforcement officers, insurance field adjusters, property preservation contractors, utility locators. It produces a one-page corroboration report to staple to the affidavit.

## Problem
The affidavit of service is sworn on the honor system, and "sewer service" — the server who files papers in a storm drain and swears they knocked — is common enough that defendants routinely allege it and courts routinely have to guess. The industry's answer has been apps that burn GPS coordinates and a timestamp onto the photo. That's theater: mock-location apps are free, and a text overlay is a text overlay. Everyone in this workflow, especially the honest servers whose license is on the line, is currently defended by a font.

## How it works
The server captures in-app. At the instant of capture the phone signs the frame with a hardware-backed key and simultaneously snapshots a corroboration bundle: GNSS raw measurements, visible cell towers, nearby wifi BSSIDs (observed, never joined), barometric pressure, magnetometer heading, and a platform attestation. Nothing is checked on the phone. Server-side, independent checks run against sources the phone can't influence: barometric pressure versus the nearest ASOS/METAR station's altimeter setting for that minute; observed BSSIDs versus a wardriving database and the org's own accumulated observations; solar azimuth from NREL SPA versus the shadow direction measured in the image; reported weather versus what the sky in the frame looks like; attestation versus known-rooted signatures. Each capture joins a per-org Merkle tree whose daily root is anchored, so nothing can be quietly backdated. Output: a score, a per-check pass/fail/not-applicable table, and plain-English lines like "pressure consistent with 34 m elevation at KBUR 14:22Z."

## Technical approach
Native iOS/Android capture; keys in Secure Enclave / StrongBox; signed C2PA manifests via `c2pa-rs` with the sensor bundle as custom assertions. Barometer check pulls NOAA `aviationweather.gov/api/data/metar`. Shadow azimuth in v2 comes from a ground-plane shadow segmentation (start with gradient + dominant-line fit; upgrade to SAM). Backend Postgres: Case → Capture → Assertion → Check → Report; daily Merkle root to an RFC 3161 timestamp authority. Report rendered server-side to PDF.

The hard part isn't any single check — it's the scoring honesty. Indoors, overcast, in a parking garage, half the checks can't run, and a system that silently converts "couldn't check" into "passed" is worse than nothing because it launders bad captures. The score must be computed only over applicable checks and the report must enumerate, by name, every check that didn't apply and why. That constraint drives the whole data model.

## v1 scope
- Android only, one org, no shadow analysis
- Three checks: barometer vs METAR, cell/wifi neighborhood plausibility, Play Integrity attestation
- Signed capture + PDF report, emailed

## Out of scope
E-filing integrations, physical document chain of custody, video, offering any opinion on admissibility, multi-tenant billing.

## Risks & unknowns
Courts may simply not care, in which case the buyer is the server's E&O insurer rather than the server — worth testing early. FRE 902(13)/(14) self-authenticating electronic records is a real tailwind but needs a lawyer's read. Capturing BSSIDs is itself a privacy artifact and must be hashed and retention-capped. A determined spoofer with a rooted phone and a replayed sensor bundle eventually wins; the goal is raising cost, not proof. The market is fragmented and unglamorous, and sells through associations, not ads.

## Done means
A capture made in a real parking lot yields a PDF in which every applicable check ran and is individually explained, and the same capture attempted with a mock-location provider and a rooted device fails at least two independent checks — with the failures named.
