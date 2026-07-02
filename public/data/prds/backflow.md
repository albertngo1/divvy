## Overview
Backflow is a mobile field tool for licensed backflow-preventer testers (plumbers, cross-connection specialists). Every commercial building, restaurant, and irrigation system in the US must have its backflow-prevention assembly tested annually by a certified tester, who then files a report with the local water purveyor. Backflow captures the test at the valve and files the district's exact form for them.

## Problem
The test itself takes 15 minutes; the paperwork is the tax. Each water district (there are thousands) mandates its own report PDF, its own field names, its own submission channel—fax, mail, a clunky portal, or email. Testers scribble gauge readings on a clipboard, then spend evenings hand-transcribing into district PDFs and chasing which jurisdiction wants what. Late or malformed filings mean fines for the building owner and callbacks for the tester.

## How it works
On arrival the tester scans the assembly's tag (QR or photo) or picks the site from history. The app shows a guided test sequence for the assembly type (RP, DC, PVB, SVB), prompting for each gauge reading and shutoff step in order, with pass/fail logic baked in. Snap a photo of the assembly and the mechanical gauge. On 'Finish,' Backflow renders the correct district PDF—pre-mapped—signs it with the tester's cert number, and submits via the district's channel (portal API, email, or generate-print-mail). The owner gets a copy; the app tracks next-due dates and auto-reminds.

## Technical approach
Flutter or React Native for offline-first field use (yards have no signal). Local SQLite for sites, assemblies, and a versioned `district-rules` JSON pack mapping district → form template + field coordinates + submission method. PDF filling via pdf-lib / AcroForm field injection; for flat scanned forms, coordinate-based text overlay. Test-sequence logic is a small state machine per assembly type encoding the AWWA test procedure. Submission adapters: SMTP email, a headless portal-fill for the big districts, and a fallback 'print packet.' The genuinely hard part is the long tail of district forms—so v1 crowdsources/hand-authors the top 20 districts and degrades gracefully to a generic AWWA form.

## v1 scope
- Guided test flow for RP + DC assemblies only
- Manual gauge entry (no gauge integration)
- 3 hardcoded district PDF templates + one generic AWWA fallback
- Email submission + PDF export
- Next-due reminder per site

## Out of scope
- Bluetooth digital test kits
- Payment/invoicing
- Multi-tester company dashboards
- Portal auto-login for every district

## Risks & unknowns
- District form sprawl is the whole ballgame; mapping is tedious and forms change
- Some districts reject non-official submissions—need to confirm accepted channels
- Cert/e-signature legal validity varies by state

## Done means
A tester completes an RP test offline, and the app produces a correctly-populated district PDF that a real water district accepts, plus a scheduled reminder for next year—no clipboard, no evening transcription.
