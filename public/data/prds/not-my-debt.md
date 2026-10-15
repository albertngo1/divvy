> **Spotted in the news:** WLOS's 'Financial abuse, housing challenges create barriers for WNC domestic violence survivors'. The damaged credit report is what blocks them from getting an apartment.

## Overview
Not My Debt is a guided workflow for domestic-violence advocates and the survivors they work with. The survivor uploads the free credit report PDFs from all three bureaus. Together they mark which accounts were coerced or fraudulent, and the tool generates the correct paperwork for each one: FCRA §605B identity-theft block requests, §611 disputes, letters to creditors, and coerced-debt affidavits in states that have statutes for them (CA, TX, ME, CT, NY and others).

## Problem
WLOS reports that financial abuse plus housing barriers keep survivors stuck. Coerced debt is widespread among survivors in shelter programs. The damage is long-lasting: a 520 credit score fails the tenant screening for almost every apartment, which leaves the survivor choosing between a shelter bed and going back to the abuser. Advocates manage 30 to 60 cases each and are not credit lawyers. A single full dispute packet takes 6 to 10 hours of letter writing and certified mail, so most never get filed.

## How it works
1. The survivor downloads reports from annualcreditreport.com and uploads the PDFs.
2. A parser pulls out each tradeline (creditor, open date, balance, address on file).
3. A card-per-account interview asks: did you open this, did you agree to it, were you forced? Accounts opened at the abuser's address get flagged automatically.
4. The rules engine chooses the remedy for each account: 605B block if an FTC IdentityTheft.gov report exists, a state coerced-debt statement where the state has a statute, otherwise a 611 dispute.
5. Output is a print-ready packet with cover letters, a list of attachments, and calendar reminders for the 30-day deadlines.

## Technical approach
The app is a web app with encrypted storage. Reports can be processed client-side so they never touch the server. Bureau PDFs are parsed with pdfplumber, with templates for each bureau's layout. A rules table, state by tradeline type mapped to remedy, is maintained with a legal-aid partner. Mail goes out through the Lob API (certified letters). The hard part is accurate parsing: the three bureaus use different and frequently changing layouts. Keeping the state statute table legally correct is the other hard part.

## v1 scope
- One state with a coerced-debt law (Texas)
- Experian, Equifax and TransUnion annual-report PDFs only
- 605B and 611 letters plus the Texas statement
- Advocate-operated, print-to-mail

## Out of scope (for now)
- Litigation and debt-collection defense
- Credit-repair "score boosting"
- Survivor-only self-serve mode

## Risks & unknowns
Unauthorized-practice-of-law concerns mean every template should be reviewed by a legal-aid partner. Survivor safety matters: no email or SMS that could reach a shared device, plus a quick-exit button. Payers are likely state DV coalitions and VAWA/VOCA grants. Survivors pay nothing. CFPB coerced-debt rulemaking may move the target.

## Done means
An advocate turns an uploaded report into a mailable packet in under 45 minutes, compared with a 6-hour manual baseline. Across the first 20 pilot cases, at least 50% of disputed coerced tradelines are blocked or deleted within 60 days.
