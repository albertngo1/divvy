> **Spotted in the news:** NPR's investigation of the skincare free-sample scheme behind consumer complaints, lawsuits and a federal investigation, where a 'free' sample ends up costing thousands.

## Overview
A shared intelligence feed for credit unions and community banks with fewer than about 100 dispute analysts in total, many with just one. It detects negative-option subscription operations (free-trial traps) that move between merchant descriptors and acquirers, and pushes block rules to each member institution's card platform.

## Problem
NPR describes a skincare scheme where a free sample leads to recurring charges costing thousands, followed by complaints, lawsuits and a federal investigation. These operations are well documented. They run dozens of nearly identical storefronts and spread volume across many merchant IDs and processors to stay under card-network chargeback thresholds. When one descriptor gets flagged, they switch to 'GLOWDERM-SKN 8885551234' instead of 'GLOW DERMA 888...'. Large issuers catch this with internal data science. A 40,000-member credit union handles each dispute one at a time. The analyst spends 20–40 minutes per case, the member gets charged again next month under a new name, and the credit union often eats the loss when the representment window closes.

## How it works
1. Each member institution uploads a daily dispute file: hashed card, merchant descriptor, MCC, acquirer BIN, amount, dispute reason code, and date.
2. Descriptor Hop normalizes descriptors and links them into operator clusters using shared signals: phone numbers in descriptors, near-identical strings, the same acquirer and MCC, matching price ladders ($4.95 then $89.97), and the same cards hit by sibling descriptors.
3. When a new descriptor joins a known cluster, every participant gets an alert and a ready-to-import block or decline rule.
4. Analysts get a pre-filled dispute packet for each cluster with the right reason code and the operator's past dispute outcomes.

## Technical approach
A Python batch pipeline with Postgres. Descriptors are normalized with tokenization, phone and URL extraction, and edit-distance blocking. Clustering uses a graph: nodes are descriptors, edges are weighted by shared signals, and clusters are connected components above a threshold, with an analyst review step before any block goes out. Card numbers are hashed with a consortium-wide keyed HMAC so co-victimization can be measured without sharing PANs. Output is CSV rules in the format the major credit-union processors accept (start with one, e.g. a common credit-union card-processing platform's block-list import). The hard part is getting enough data to see anything, plus processor integration. One credit union's disputes are too thin, so the product only works once roughly 15 institutions contribute.

## v1 scope
- One credit-union league or CUSO as the pilot consortium (target 10 institutions)
- Daily SFTP upload of dispute CSVs
- Descriptor clustering plus a weekly 'new aliases' email
- Manual block-list CSV export

## Out of scope (for now)
- Real-time authorization scoring
- Consumer-facing app
- Reporting to regulators or networks

## Risks & unknowns
Data-sharing agreements and GLBA review will be slow. Going through a credit-union league or CUSO that already shares data is the realistic wedge. Card networks and large processors already run merchant-monitoring programs, so the value is limited to the small-issuer gap. Over-blocking a legitimate merchant creates member complaints, so human review is required. Who pays: per-institution SaaS of roughly $300–800/month, justified by dispute write-offs and analyst hours saved.

## Done means
With 6 months of historical disputes from at least 8 pilot institutions, back-testing shows Descriptor Hop would have flagged at least 60% of repeat-operator charges at least one billing cycle earlier than the first member dispute. Clusters reviewed by analysts have a false-merge rate under 5%.
