> **Spotted in the news:** News12's 'NYC's Debt Demolisher Program Offers Relief On Outstanding City Violations.' It is the latest in a recurring cycle of short relief windows that targeted debtors mostly miss.

## Overview
A lookup and action tool for owners of 1–10-unit NYC buildings and small storefront businesses. It finds their outstanding OATH/ECB judgments, models what each relief program would waive, and walks them through paying or contesting before the deadline.

## Problem
NYC has issued millions of OATH summonses (DOB, sanitation, FDNY, DOT). Defaulted ones turn into judgments with 9% interest and penalties that can be several times the original fine, and they show up as liens on title searches. Small owners often don't know about them until a refinancing or sale stalls. The city runs periodic relief programs, the Debt Demolisher being the current one, that waive penalties and interest if you pay principal by a date. Uptake is low because figuring out eligibility needs several lookups across city portals, and the rules (which agencies, which years, default vs. adjudicated) are buried in program FAQs. Each missed window costs an owner hundreds to tens of thousands of dollars.

## How it works
1. Enter an address, BBL, or business name.
2. The tool queries the OATH Hearings Division Case Status dataset on NYC Open Data plus DOB/ECB violations and lists every open judgment with its balance.
3. Each judgment is tagged ELIGIBLE / NOT ELIGIBLE / CHECK under the current program's rules, showing the dollar waiver and the payment-by date.
4. It produces a checklist: which to pay online now, which to move to vacate (default judgment you never got notice of), which are actually a prior owner's.
5. It sends email or SMS reminders until the window closes.

## Technical approach
Socrata APIs for NYC Open Data (the OATH case status dataset, DOB ECB violations, the HPD violations dataset for context) and PLUTO for BBL resolution from addresses. The program rules are hand-encoded per relief program with an effective-date table. The stack is a static frontend with a small Python API and a cache of the OATH dataset. The genuinely hard part is respondent matching: summonses are issued to messy names ('JOHN DOE OWNER', LLC variations, old owners), and the address fields are inconsistent. The tool needs fuzzy matching plus a 'claim this one' step by the user, and it must never present a false-negative 'you're clear.'

## v1 scope
- Address/BBL lookup against the OATH open data
- Eligibility tagging for the current program only
- Savings total and deadline countdown
- Links to the city's pay portal

## Out of scope (for now)
- Paying on the user's behalf
- Legal motions to vacate
- Other cities

## Risks & unknowns
The city might build this itself, or programs might be too infrequent to sustain a product. A plausible sustainer is a lead-gen fee from expediters and attorneys who handle vacate motions, or title companies/mortgage brokers who hit these liens at closing. Open data may lag the city's actual balances by days, so the tool must say 'verify on the city portal.' Free tools face a trust problem when they ask for property data.

## Done means
For 20 real BBLs pulled from a landlord association, the tool's open-judgment list matches what the city portal shows. At least 5 owners pay under the program before the deadline, with savings over $1,000 each.
