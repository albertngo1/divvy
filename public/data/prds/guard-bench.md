> **Spotted in the news:** 'No room to take a breath': S.F. swim clubs squeezed by city lifeguard shortage (SF Chronicle). The shortage hurts most through same-day cancellations when a single guard is out, and every operator has certified guards sitting idle at another pool across town.

## Overview
Guard Bench is a substitute-shift marketplace for certified lifeguards, shared across pool operators in one metro: city rec departments, YMCAs, school districts, private clubs. It works like the substitute-teacher systems schools already use, but crosses employer boundaries.

## Problem
The SF Chronicle story describes swim clubs squeezed by the city's lifeguard shortage. The daily failure is narrower than the headline. A pool needs, say, 3 guards on deck. When one calls out at 5am, the pool closes lanes or cancels the session. Masters and age-group clubs, which rent lane time, lose practices they paid for, and coaches spend mornings rescheduling. Meanwhile guards certified through the Red Cross or YMCA work part-time at one operator and would happily pick up shifts at another, but each operator hires, verifies and schedules in its own silo.

## How it works
- Guards sign up and upload their certification. Guard Bench verifies it through the issuer's certificate lookup (Red Cross has a public certificate-validation page) and tracks expiry.
- Operators post open shifts with pool, time, pay and required certs (deep water, waterfront).
- Qualified guards nearby get an SMS. The first to claim gets the shift, and the operator confirms.
- **Employment model:** v1 does not employ anyone. Each operator pre-onboards bench guards as on-call hires, so Guard Bench is only the matching and notification layer.

## Technical approach
- Next.js plus Postgres, Twilio SMS.
- **Data model:** Guard(certs[], expiries, home_pools, availability), Operator, Shift(pool, start, certs_required, status).
- **Cert verification:** scrape or lookup against the Red Cross certificate validation page; manual review for Ellis and StarGuard certs.
- **The hard part:** HR, not code. Each operator needs a guard on its own payroll and insurance before that guard can work a shift, so the product has to make multi-employer pre-onboarding painless, with a shared document packet and expiry tracking.

## v1 scope
- One metro, 2-3 operators (one city department, one YMCA, one private club)
- Post shift → SMS → claim → confirm
- Cert upload with expiry reminders
- No payments; each operator pays through its own payroll

## Out of scope (for now)
- Running payroll or employing guards (staffing-agency model)
- Training and certification classes
- Lane booking for clubs

## Risks & unknowns
- **Unions:** city lifeguards are often unionized, and contracts may restrict outside or on-call staff. This could block the city operator entirely.
- **Who pays:** operators, about $200/month per facility. City procurement is slow, so YMCAs and private clubs are the likely first buyers.
- **Liability:** operators may refuse guards trained on another operator's site-specific protocols.

## Done means
At 3 pilot facilities over one season, at least 60% of posted same-day shifts are filled within 90 minutes. Lap-lane cancellations attributable to a missing guard fall by half against the prior season's logs.
