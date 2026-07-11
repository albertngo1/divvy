## Overview
Off-Ramp is a B2B SaaS that continuously audits subscription cancel flows for compliance with the wave of new laws — NYC's just-announced deceptive-subscription ban, the FTC click-to-cancel rule, and California's ARL. It's for growth/legal teams at any company that bills recurring cards: media, SaaS, gyms, DTC boxes.

## Problem
Overnight, 'make cancellation as easy as signup' went from best practice to enforceable law with real fines and AG lawsuits. Product teams have no idea whether their own funnel is compliant, because the person who added the retention interstitial left two years ago. Legal can't read code; engineers don't know the rulebook. Nobody owns the cancel path, so it quietly rots into a roach motel that is now a legal liability.

## How it works
You point Off-Ramp at a live account (a real test subscriber it manages on a virtual card). Every night a headless browser signs up, then attempts to cancel, recording each screen. A rubric engine scores the funnel: is cancel reachable without a phone call? same number of clicks as signup? no pre-checked 'keep my plan'? no guilt-trip dead ends? no surprise 'are you sure' loops beyond one. It emits a red/amber/green report, a screenshot timeline as court-ready evidence, a diff when the funnel changes, and a public 'Off-Ramp Verified — checked nightly' badge that links to the latest passing run. Competitor funnels can be scanned too, so sales/legal can benchmark.

## Technical approach
Playwright fleet on a queue (BullMQ) driving disposable browser contexts; Stripe test-mode + Privacy.com-style virtual cards for real card funnels. Each merchant funnel is a small declarative recipe (selectors + expected steps) plus a generic auto-explorer that follows cancel-ish links via an LLM DOM classifier when no recipe exists. Rubric is a versioned ruleset keyed to jurisdiction (NYC/FTC/CA), each rule a predicate over the recorded step-graph. Store runs as an append-only event log; render evidence PDFs with Puppeteer. Hard part: reliably navigating hostile, A/B-tested, bot-detecting cancel flows without the merchant whitelisting you, and mapping fuzzy legal language to deterministic, defensible checks.

## v1 scope
- One merchant, one recipe, nightly Playwright run
- Five hard-coded rules (FTC symmetry + no forced call)
- Green/red email with screenshot strip
- Static badge endpoint

## Out of scope
- Auto-fixing the funnel
- Legal certification / indemnity
- Multi-jurisdiction rule packs

## Risks & unknowns
Bot detection blocks the crawler; virtual-card signups get flagged as fraud; 'compliant' is a legal judgment we can only approximate; badge could imply guarantees we can't back.

## Done means
Off-Ramp signs up and cancels a real test subscription on one funnel unattended, flags a deliberately inserted dark pattern as a red finding with a screenshot, and clears it green after the pattern is removed.
