## Overview
Clawback is a B2B SaaS that audits your cloud bill *against the vendor*, not for optimization. It ingests your AWS Cost and Usage Report, cross-checks every line item against your actual metered usage and resource inventory, and surfaces dollar-quantified overcharges — then packages the evidence into a credit claim. For finance/FinOps teams at companies spending $50k+/month on AWS.

## Problem
The HN front page just watched AWS admit $1.7B of *inaccurate estimated billing*. Nobody audits the vendor. Finance teams reconcile vendor invoices for every other expense, but cloud bills are treated as ground truth. Meanwhile overcharges pile up: NAT gateway data-transfer double-metered, EBS billed on deleted volumes, savings-plan coverage gaps, tax/estimate drift between the daily estimate and the finalized invoice. Existing FinOps tools (Vantage, CloudHealth) optimize *your* usage; none check whether AWS's own math is right.

## How it works
Connect the CUR (Parquet in S3) read-only, plus CloudWatch metrics and an AWS Config resource inventory. A rules engine reconciles: does a data-transfer charge match observed bytes? Is a volume still alive? Is committed-use discount coverage applied where eligible? Does the estimated bill drift from the finalized one beyond tax? Each discrepancy becomes a claim card with an evidence trail and a drafted AWS Support ticket.

## Technical approach
Python + DuckDB to query the CUR Parquet directly; boto3 for CloudWatch/Config. Data model: `line_item`, `resource`, `metric`, `discrepancy`. Key algorithm: join billed usage-types to physical resources to metrics. The genuinely hard part is AWS's usage-type taxonomy — hundreds of opaque, undocumented codes (`USE1-DataTransfer-Out-Bytes`, etc.); we ship a curated, versioned mapping pack. We also diff the daily CUR revisions to catch estimate→final drift.

## v1 scope
- Single AWS account, read-only CUR ingest
- Three checks: idle EBS/EIP, NAT double-charge, unapplied savings plan
- A static HTML report with dollar amounts and evidence

## Out of scope
- Multi-cloud (GCP/Azure)
- Auto-filing tickets (draft only)
- RI/SP purchasing recommendations

## Risks & unknowns
AWS may reject claims or absorb them silently; the usage-type mapping is brittle and version-sensitive; must differentiate hard from optimization tools or get lumped in. Legal framing of "the vendor overcharged you" needs care.

## Done means
Given a real CUR, Clawback flags at least one dollar-quantified discrepancy with an evidence trail an AWS TAM would accept as a valid credit request.
