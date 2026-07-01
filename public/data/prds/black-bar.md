## Overview
A document-inspection game where you play a government redaction clerk clearing FOIA requests for release. You drag a black marker over names, SSNs, and secrets while a clock and a daily quota bear down. For puzzle/bureaucracy-sim fans and privacy nerds who've felt the specific dread of hitting "send" on a document.

## Problem
Redaction is high-stakes bureaucratic tension nobody has turned into a game: miss one identifier and it leaks to the press; over-redact and the requester (and journalists) revolt at a page of black bars. Both failure modes are humiliating, which is exactly what makes it fun.

## How it works
Each shift you get a stack of documents and a rules-of-the-day card ("today: all PII"; "tomorrow: also operational locations"). You drag black bars over spans and submit. Scoring punishes both leaks (missed sensitive spans) and over-redaction (needlessly hidden text triggers appeals); speed earns a bonus. Escalation: released docs get FOIA-appealed, forcing you to justify each bar. Mischief: occasionally a memo quietly orders you to bury something merely *embarrassing*, and a conscience meter ticks.

## Technical approach
Browser game, React + Canvas/PIXI. Documents are procedurally generated from bureaucratic templates with injected entities, so ground-truth sensitive spans are known at generation time; the scorer compares your bars to them via character-span IoU. To make it feel real, it also runs a Presidio-style detector — regexes for SSN/email/phone plus lightweight NER (compromise.js or a wasm spaCy) — so the game can grade "what a real system would have caught" and show you exactly what slipped through. Data model: `doc = { text, entities:[{ span, type, mustRedact }] }`. The hard part is generating text that reads like genuine bureaucratic prose with plausibly-buried secrets, and tuning the two failure modes so both actually sting.

## v1 scope
- One document type (personnel memo)
- PII-only rules
- Drag-to-redact with the black marker
- Span-IoU scoring with a visible diff of missed spans
- 5-document day, one fail state

## Out of scope
- Appeals / justification system
- Conscience meter and embarrassment memos
- Multiple rotating rule regimes
- NER (v1 is regex-only)

## Risks & unknowns
- Fun hinges entirely on procedural-text quality
- Canvas redaction UX is fiddly (partial bars, overlaps)
- Span-scoring edge cases around partial coverage

## Done means
You can play a 5-document day, get scored on leaks vs over-redactions with a visible highlight of every span you missed, and a run with too many leaks ends the shift with a fail screen.
