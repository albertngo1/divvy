## Overview
Backflow is a mobile app for certified backflow-assembly testers (plumbers, fire-sprinkler techs, cross-connection specialists). It guides the physical test procedure, captures gauge readings offline, and auto-fills the correct water purveyor's official test report form as a submit-ready PDF.

## Problem
Every commercial building, restaurant, and irrigation system with a backflow preventer must be tested annually and filed with the local water utility. The tester does a fiddly valve-by-valve procedure with a differential pressure gauge, scribbles readings on a clipboard, then back at the truck retypes them into a *different PDF for every jurisdiction* (each utility has its own mandated form). It's error-prone, and a wrong form gets rejected. OfficeCLI trending on HN — programmatic form/doc editing for agents — is the exact primitive this workflow has been missing.

## How it works
Tester scans/enters the assembly (RP, DC, PVB, DCDA), size, serial, and location. The app presents the correct step-by-step test sequence for that assembly type (e.g. RP: close #2, read across #1; bleed to check #2; open relief-valve reading). At each step it prompts for the specific gauge number and validates it in-range (relief valve ≥2 PSID, check valves ≥1 PSID) with pass/fail logic baked in. Tester signs with certificate number on-glass. The app selects the purveyor's form template by GPS/utility picker and stamps every field into the real PDF, then emails/uploads it and logs the assembly for next year's renewal reminder.

## Technical approach
React Native / Expo, fully offline-first: SQLite for assemblies, tests, and renewal schedule. Form filling via pdf-lib with a per-jurisdiction JSON pack mapping field names → PDF coordinate boxes (the OfficeCLI-style layer), version-pinned so a utility's form revision doesn't silently break output. Test-procedure logic is a small state machine keyed on assembly type; pass/fail thresholds live in editable config. Signatures captured as SVG→PNG. Submission via mailto/SMTP or utility portal deep-link. The genuinely hard part is building and maintaining the library of jurisdiction form templates + field maps — start with the 10 biggest US water utilities and let testers submit new form PDFs for crowd-mapping.

## v1 scope
- Two assembly types (RP + DC) with guided procedure and validation
- One hardcoded jurisdiction PDF template + one generic USC form
- Offline capture, signature, PDF export via share sheet
- Local list of tested assemblies with annual renewal reminder

## Out of scope
- Direct utility-portal API submission
- Billing/invoicing, dispatch, multi-tech crews
- Gauge Bluetooth auto-read

## Risks & unknowns
- Form-template maintenance is ongoing toil across thousands of utilities
- Pass/fail thresholds vary slightly by state code
- Testers are habit-driven; adoption needs it to be faster than the clipboard

## Done means
A tester completes an RP test on their phone offline, and the app produces a correctly-filled, signed jurisdiction PDF matching what they'd have typed by hand — verified field-by-field against a real submitted form.
