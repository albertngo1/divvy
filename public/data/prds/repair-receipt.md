> **Spotted in the news:** Miami Times' 'Liberty City housing residents cite leaks and unanswered repairs', and the East Greenwich condo complaints review. Repair requests disappear and nothing is documented.

## Overview
Repair Receipt is an SMS-first repair log for tenants in public and subsidized housing and for the tenant unions and legal-aid groups that organize them. A tenant texts a number with a photo and one line of description. They get back a case number, a timestamped hash of the evidence, and an automatically generated written notice that follows their state's repair statute. The notice can be emailed to management or printed for certified mail.

## Problem
The Miami Times reports Liberty City residents citing leaks and unanswered repairs while a renovation plan moves forward. The pattern is common. Requests made by phone or at a front desk leave no paper trail. Florida §83.60 rent withholding, and similar remedies in other states, only work if the tenant served written notice and waited 7 days, which most tenants never do correctly. HUD REAC inspections happen at most once a year. As a result, legal aid can't build a case, and mold and leaks keep getting worse while kids develop asthma.

## How it works
1. The tenant texts something like "bathroom ceiling leaking, unit 4B" with a photo.
2. The system stores the image with a SHA-256 hash and server timestamp, then replies with case #1123.
3. If the tenant opts in, it produces the state-specific written notice (Florida 7-day) as a PDF and emails management or gives the tenant a print link.
4. On day 7 and day 14 it texts the tenant to ask whether the repair was fixed (Y/N/photo).
5. The organizer dashboard groups open cases by building and problem type, and exports a dated evidence binder for code enforcement, HUD complaints or court.

## Technical approach
The stack is Twilio SMS/MMS, a small Python backend, Postgres, and S3 with object lock for evidence. Notices are generated from a per-state template table. Unit and building normalization uses address parsing. Optional: match buildings against HUD's public-housing development dataset and REAC inspection scores. The hard part is the legal templates. Notice requirements differ by state and by subsidy type (public housing grievance procedures fall under 24 CFR 966). Getting tenants to keep using it after the first text is the other hard part.

## v1 scope
- Florida only, one tenant association
- SMS intake, photo hash, case number
- Florida 7-day notice PDF
- Organizer CSV export

## Out of scope (for now)
- Landlord-side work-order integration
- Rent escrow management
- Spanish/Haitian Creole UI (v2, and urgent)

## Risks & unknowns
Tenants fear retaliation, so notices must be opt-in and the tool should explain anti-retaliation protections. Funding would come from tenant unions or legal-aid grants, since tenants won't pay. Landlords may claim they never received email notices, so certified mail is safer. Courts accepting a hash plus timestamp as evidence is plausible but untested.

## Done means
One Liberty City-sized complex logs at least 100 repair cases within 60 days. Legal aid or code enforcement uses at least one exported binder in a real complaint. The median time from first report to written notice falls below 2 days.
