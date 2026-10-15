> **Spotted in the news:** Agweek's 'Priced out: Rural families weigh dropping health coverage', combined with farm-loss stories (papaya and swine-fever losses, ticks and drought in Missouri) showing how much farm income swings from year to year.

## Overview
A year-end planning worksheet for farm households that get health insurance through the ACA marketplace. It is used by the people who already sit across from farmers in November: Farm Credit loan officers, extension farm-management specialists, and small-town tax preparers.

## Problem
Agweek reports rural families weighing whether to drop health coverage because they are priced out. Self-employed farm families are among the biggest users of the marketplace. Their premium tax credit is set by one calendar year's MAGI, while farm income swings widely between years. If the enhanced subsidies lapse and the 400%-of-poverty cliff returns, a family of four that crosses it by $1 can lose more than $15,000 of credit. A family in the subsidy range also gets less help on a sliding scale with each extra dollar of reported income. Farmers have more legal control over when income lands than wage earners do. They can defer grain sales with deferred-payment contracts, prepay next year's inputs, time equipment purchases under Section 179 or bonus depreciation, and use income averaging, although income averaging does not lower MAGI, which is a common mistake. Most farm tax preparers optimize income tax and never model the effect on the premium credit. The family learns the result in April, when they have to repay advance credits.

## How it works
1. Enter household size, state, county (which sets the benchmark premium), and projected Schedule F and other income.
2. The tool shows where the household sits against the PTC curve: premium owed, credit, and the marginal cost of the next $1,000 of income.
3. Add candidate moves (defer $X of grain sales, prepay $Y of fertilizer, buy a $Z planter), each with its cash-flow, income-tax and SE-tax effects.
4. It shows the net effect of each move after income tax, SE tax and the PTC, plus the effect on next year's projected MAGI, so deferrals don't just stack up and cause a cliff hit next year.
5. Export a one-page summary for the family and their preparer.

## Technical approach
A static web app with no account and nothing stored server-side. Uses the CMS marketplace API for the second-lowest-cost silver plan by county and age. Federal poverty guidelines and applicable-percentage tables are versioned by tax year. A small federal income-tax and SE-tax engine (brackets, standard deduction, QBI approximation). State tax is left out of v1. The hard part is getting the rules right: prepaid-expense limits (the 50% rule for farm prepaids), the CCC-loan and deferred-contract rules, and whichever of the enhanced-subsidy or cliff regimes applies in a given year. Every rule needs a test with a cited source.

## v1 scope
- Federal only, one tax year
- Three move types: defer sales, prepay inputs, Section 179
- Two-year view (this year plus next)
- Printable summary with a 'not tax advice' banner

## Out of scope (for now)
- Filing or e-file
- State taxes, Medicaid/CHIP interactions
- Partnership/S-corp farms

## Risks & unknowns
Who pays: Farm Credit associations and extension programs could license or sponsor it as a member service. Farmers themselves will rarely pay. Tax preparers may be suspicious of a tool that second-guesses their work. The subsidy rules depend on what Congress does, so the whole value can shift in a single year. That argues for a regime toggle, not for not building it. Liability: everything must be framed as scenarios for a professional to review.

## Done means
For 10 de-identified real farm returns supplied by an extension partner, the tool's PTC figure matches the Form 8962 actually filed within $100. In at least 3 of those cases, it identifies a legal move that would have saved more than $2,000 net.
