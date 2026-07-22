## Overview
Scale is a mobile/web tool for small electrical, concrete, and mechanical subcontractors on prevailing-wage (Davis-Bacon) public jobs. It generates the weekly federal WH-347 certified payroll report and, crucially, checks each worker's hours against the official wage determination so the contractor catches underpayment before a compliance officer does.

## Problem
Anyone doing government construction must file certified payroll every week — a notarized statement of who worked, their classification, hours, and that they were paid at least the prevailing wage for that trade in that county. Small subs still do this in Excel and mail carbon-copy WH-347s. Get a classification or fringe rate wrong and you face withheld payment, back-wage penalties, or debarment. The wage determinations themselves are dense PDFs on SAM.gov that change per county and per trade.

## How it works
The contractor sets up a project by pasting the federal wage-determination number; Scale pulls the applicable trade classifications and base+fringe rates. Each day a foreman logs workers, classification, and hours (offline-capable). At week's end Scale computes gross pay, cross-checks effective hourly rate (incl. fringe) against the determination, and highlights any line below scale in red with the exact shortfall. Approve, and it renders a filled, signature-ready WH-347 PDF matching the DOL form exactly, plus a compliance summary. History is retained for the audit window.

## Technical approach
Stack: Next.js + Postgres, PDF generation via pdf-lib stamping the official WH-347 template (fixed government layout). Data source: the SAM.gov Wage Determinations API (WDOL) to fetch determination text and rates by county/trade; parse the semi-structured determination into a `{classification, base_rate, fringe}` table. Data model: `project → workers → daily_entries → weekly_payroll`. Core logic: for each worker-week, effective_rate = (base_pay + fringe_credit)/hours; flag if < determination rate for their classification, with overtime at 1.5× on hours >40. Hardest part: reliably parsing wage-determination documents — classifications are inconsistently named across counties, so v1 uses assisted mapping (the contractor confirms an LLM-suggested classification match once per project) rather than pretending to fully automate it.

## v1 scope
- Manual project setup with hand-entered classifications + rates
- Daily hour entry per worker, offline-capable PWA
- Prevailing-wage underpayment flag with shortfall amount
- Export a filled WH-347 PDF for one week

## Out of scope
- Actual payroll/tax processing or direct deposit
- State-specific supplemental forms (CA A-1-131, etc.)
- Automated notarization/e-filing to agency portals

## Risks & unknowns
- Wage-determination parsing accuracy across trades/counties
- WH-347 has fringe-benefit reporting nuances (paid-in-cash vs to-plans) that must be exact
- Liability framing — it must be a filing aid, not legal advice

## Done means
Given a real wage-determination number and a week of entered hours including one deliberately underpaid worker, Scale produces a WH-347 PDF that opens correctly in the DOL fillable form, and the underpaid worker is flagged with the correct dollar shortfall while compliant workers pass clean.
