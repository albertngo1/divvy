> **Spotted in the news:** NPR's 'Inflation sizzled in September — and Social Security benefits will get a boost.' The COLA announcement that follows the September CPI starts the yearly benefits-cliff season.

## Overview
A caseload screening tool for State Health Insurance Assistance Program (SHIP) counselors, Area Agencies on Aging, and legal aid benefits units. Enter each client's household income and assets once. When the COLA is announced, the tool flags who is projected to fall off which program in January and by how much.

## Problem
The COLA is calculated from the third-quarter CPI-W, so the hot September print sets next year's raise. Program limits for MSP (QMB/SLMB/QI), Part D Extra Help, SNAP, and state Medicaid buy-ins are tied to the Federal Poverty Level, which updates later and on a different schedule. In the gap, a client 2% under the line can end up 0.5% over it. Losing QMB means the $185+/month Part B premium comes back out of their check, plus copays, which can wipe out the raise many times over. Counselors find out in February, when clients call confused. Each SHIP counselor carries hundreds of clients and does this math by hand, if at all. Many states also allow deductions or disregards (medical expenses for SNAP, state-specific MSP disregards) that would keep the client eligible if someone documented them.

## How it works
1. The counselor imports their caseload as a CSV (income sources, household size, assets, state, current programs).
2. On COLA day, the tool applies the announced percentage to SS income, projects FPL using the trend, and later swaps in the real FPL when HHS publishes it.
3. Each client gets a status per program: SAFE, AT RISK (within 3%), or LOSES. The tool shows the dollar impact of losing each program.
4. For each AT RISK or LOSES client, it lists the specific levers available in that state (an unclaimed medical deduction, a state disregard, a QI waitlist) and generates a call script and a document checklist.

## Technical approach
A Python rules engine with versioned per-state program rules stored as YAML: limits, disregards, asset tests, effective dates. Sources are SSA COLA announcements, HHS poverty guidelines, CMS MSP limits, USDA SNAP COLA tables, and state Medicaid manuals. It runs locally or as a single-tenant deployment, because the data is PII and HIPAA-adjacent, and it needs no SSA integration. The genuinely hard part is getting per-state rules right and keeping them updated. Each state counts income differently ($20 general disregard, earned-income disregards, whether the Part B premium is deducted), and a wrong rule erodes trust instantly. v1 should cover one or two states, verified line by line against counselor knowledge.

## v1 scope
- 2 states (e.g. PA, CA)
- MSP + Extra Help only
- CSV in, ranked risk list out
- Per-client PDF with the math shown

## Out of scope (for now)
- SNAP and Medicaid long-term care
- Client-facing app
- Filing applications

## Risks & unknowns
Who pays: SHIP grants are small. Plausible buyers are state SHIP directors, AAAs, or legal aid on a small yearly license, or a foundation such as NCOA's ecosystem. Counselors may already use benefits screeners like BenefitsCheckUp, but those are client-facing and single-household, not batch projections. The impact of keeping a client eligible depends on state flexibility. PII handling will slow adoption.

## Done means
A real SHIP office runs its caseload in October. At least 5 clients are flagged AT RISK, and for at least 2 of them an intervention documented in the tool keeps them on MSP in January.
