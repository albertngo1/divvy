## Overview
A fully-local desktop/CLI tool for the growing tribe of people who've sequenced their own DNA at home (or exported raw 23andMe/AncestryDNA data). It reads your raw genotype file and produces a plain-English pharmacogenomics report: how your body metabolizes common drugs and everyday compounds (caffeine, codeine, warfarin, SSRIs, PPIs). For the curious biohacker who has raw reads and zero tools that don't demand uploading their genome to a stranger's server.

## Problem
Home sequencing is now cheap—nanopore MinION, or a $99 spit kit's raw export. But the raw FASTQ/VCF/`.txt` genotype file is inert. Interpretation services either (a) don't touch pharmacogenomics for liability reasons, or (b) require uploading your genome. Your most sensitive data, shipped to someone's S3 bucket, to answer a question a lookup table could answer offline.

## How it works
Drop in your raw file. First Pass extracts the ~40 rsIDs that define star-alleles for the big pharmacogenes (CYP2D6, CYP2C19, CYP2C9, VKORC1, TPMT, SLCO1B1), diplotypes them, maps diplotype→metabolizer phenotype (poor/intermediate/normal/rapid/ultrarapid), and renders a report: 'CYP1A2 *1A/*1A — rapid caffeine metabolizer, expect short half-life' with the CPIC/PharmGKB citation and a bold non-diagnostic disclaimer. Every claim links to its evidence level.

## Technical approach
Stack: Python + a small React/Tauri viewer, everything local. Parse 23andMe/AncestryDNA TSV and VCF via `cyvcf2`; for nanopore FASTQ, optional `minimap2` align to a bundled reference subset + `bcftools` call, but v1 assumes an already-genotyped file. Bundle a curated JSON of CPIC allele-definition tables and PharmGKB clinical annotations (both openly licensed) so the tool ships self-contained—no network call ever. Data model: `gene → {defining rsIDs, star-allele definitions, diplotype→phenotype map, drug guidance}`. Hard part: CYP2D6 diplotyping is genuinely nasty (copy-number variants, hybrid alleles, gene deletions) that consumer chips can't fully resolve—v1 honestly reports 'CYP2D6: indeterminate from array data' rather than faking confidence.

## v1 scope
- Parse 23andMe/AncestryDNA raw text export
- Cover 4 genes with clean SNP-based calls: CYP2C19, CYP1A2, VKORC1, TPMT
- Single static HTML report with citations + disclaimer
- 100% offline, no telemetry

## Out of scope
- CYP2D6 CNV resolution, FASTQ alignment pipeline, disease-risk, ancestry, any 'talk to a doctor' feature beyond the disclaimer.

## Risks & unknowns
Medical liability—must be framed strictly educational/informational, never dosing advice. Array data misses/miscalls rare alleles. PharmGKB/CPIC license terms for redistribution need checking. Users may over-trust output.

## Done means
Given a real 23andMe raw export, the tool outputs a report correctly calling CYP2C19 and VKORC1 phenotypes matching an independent CPIC lookup, with zero network requests observed in a packet capture during the run.
