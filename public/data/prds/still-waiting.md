> **Spotted in the news:** 'New state-funded housing voucher waitlist opens for Minneapolis families' (5 Eyewitness News). Lists like this open for a few days, then go quiet for years and get purged by mail, so what actually removes families is missed paperwork rather than how long they waited.

## Overview
Still Waiting is a lightweight tracker for nonprofit housing caseworkers: shelter staff, reentry navigators, domestic-violence advocates. Each of them manages 30-80 clients, and each client sits on 3-15 housing waitlists run by different public housing authorities (PHAs) and project-based properties.

## Problem
The Minneapolis voucher list in the news opens briefly and then won't reopen for years. Applicants who do get on a list face periodic "purge" or "update" letters. PHAs mail them, give 10-30 days to reply, and remove anyone who doesn't. Unstably housed people move constantly, so letters bounce and years of waiting vanish. Caseworkers track this in spreadsheets, sticky notes, or not at all. Each purge costs a family 2-7 years of position, and a caseworker learns about it only when the client asks "where am I on the list?" and the answer is "nowhere."

## How it works
- The caseworker adds a client and the lists they're on: PHA, program, application date, confirmation number.
- The system keeps a registry of each list's known purge cadence, its response method (mail, portal, phone), and whether it is currently open.
- The caseworker is listed as the alternate contact where PHAs allow it. Still Waiting gives them a dedicated mailing address and a parsing inbox for forwarded letters.
- A weekly digest shows: lists opening this week that fit each client's eligibility, purge letters due, and clients with no update in 12+ months.

## Technical approach
- Postgres plus a small Rails or Next.js app, SMS through Twilio.
- **List registry:** a scraper of PHA "waitlist status" pages plus HUD's PHA contact dataset, starting with one metro (Twin Cities, about 20 PHAs). Pages are inconsistent HTML or PDF, so each PHA gets a per-site extractor and a human reviews changes.
- **Data model:** Client, ListMembership(status, last_confirmed, next_purge_est), WaitList(pha, program, open_window, purge_cadence).
- **The hard part:** purge timing is mostly undocumented. It has to be inferred from letters forwarded by many caseworkers, so the registry gets more accurate as more agencies use it.

## v1 scope
- One metro, one partner agency, about 10 caseworkers
- Manual list entry and manual entry of letters (photo upload)
- Open/close monitoring for 20 PHA pages
- Weekly email digest plus SMS deadline reminders

## Out of scope (for now)
- Submitting applications on the client's behalf
- Any PHA API integration
- A client-facing app

## Risks & unknowns
- **Who pays:** Continuum of Care agencies and United Way grants. Expect about $50 per caseworker per month, with slow procurement.
- **Data rules:** HMIS vendors (WellSky, Bitfocus) may see this as overlap, and client data needs consent and HMIS-compatible privacy handling.
- **Uneven benefit:** some PHAs won't accept a third-party contact, which limits the alternate-contact approach.

## Done means
At one partner agency over 6 months, at least 90% of purge or update letters for enrolled clients get a response before their deadline, compared with the agency's own baseline. Also, at least 3 newly opened lists are flagged to caseworkers within 48 hours of opening.
