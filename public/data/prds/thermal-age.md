## Overview
A solo, turn-based lab management puzzle. You run an ancient-DNA facility with a fixed budget and a queue of procedurally generated specimens — a permafrost horse metapodial, a cave-floor bear tooth, a museum thylacine pelt tanned in 1936, a Cretaceous bone somebody insists is worth trying. Your job is to decide what's worth sequencing and how, and the simulation underneath uses the real published damage kinetics rather than a fun-feeling fudge. For people who like Universal Paperclips and also like being told no by physics.

## Problem
Every piece of de-extinction media treats degraded DNA as a plot obstacle you can hand-wave past. Nobody has built the thing that lets you *feel* the exponent: that at 13 °C a 242 bp mtDNA fragment has roughly a 521-year half-life, that burial temperature dominates everything, and that the gap between a 40,000-year-old permafrost mammoth and a 66-million-year-old fossil isn't a harder version of the same problem — it's around 1,600 half-lives, which is nothing at all.

## How it works
Each specimen is generated with hidden parameters: age, burial temperature history (drawn from a paleoclimate lookup by latitude/period), tissue type, and endogenous DNA fraction. From these the sim derives a **thermal age** (time-equivalent years at 10 °C via Arrhenius) and from that a fragment-length distribution and a 5'-end C→T deamination profile following the Briggs geometric decay.

Each turn you spend budget on: extraction protocol, single- vs double-stranded library prep, USER/UDG treatment (removes deamination damage but shortens usable reads and costs yield), and sequencing lanes. The output is a read set. You then see what you actually got — coverage depth, endogenous fraction after the microbial soup takes its cut, and whether the reads are long enough to map to a living relative's reference genome at the divergence you're facing. Reference bias is a real trap: map to a too-distant relative and your "recovery" is mostly the relative.

A run ends with a verdict: recoverable, partially recoverable (mitogenome only), or dust — and a receipt showing where the money went.

## Technical approach
TypeScript + a canvas UI, no backend; everything is a closed-form draw plus a Poisson/negative-binomial coverage model, so a full run resolves in milliseconds. Core math: Arrhenius rate scaling for depurination (Ea ≈ 127 kJ/mol), exponential fragment-length distribution parameterized by per-site breakage rate, Lander–Waterman for coverage from read count and read length, and a simple mapping-efficiency curve as a function of read length × divergence. Real parameter anchors come from Allentoft 2012 (moa bones), Briggs 2007 (damage patterns), and Dabney 2013 (short-fragment extraction). The genuinely hard part is legibility: a sequencing budget sim is four numbers changing, and it has to *read* as tension rather than a spreadsheet.

## v1 scope
- One specimen, fixed: a 40 ka permafrost bone.
- Three choices: extraction protocol, UDG yes/no, number of lanes.
- One output screen: fragment histogram, coverage, verdict.
- No progression, no meta-economy, no art.

## Out of scope
Actual genome assembly, CRISPR editing minigames, live animals, multiplayer, anything with a dinosaur that works.

## Risks & unknowns
The honest model may make most runs feel unwinnable — needs a difficulty curve that comes from *specimen selection* rather than softening the chemistry. Parameter sourcing takes an afternoon of reading. It may end up more of a teaching toy than a game, which is an acceptable landing spot.

## Done means
Playing two specimens 40,000 years apart in thermal age produces visibly different fragment histograms and opposite verdicts, and a biologist reading the receipt screen doesn't find a number that's wrong by an order of magnitude.
