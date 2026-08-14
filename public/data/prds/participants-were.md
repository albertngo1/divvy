## Overview

A screening service sold to conference program chairs, journal editorial offices, and university research-integrity offices. Feed it a batch of submitted manuscripts; it returns a triage queue: which papers appear to involve human participants, and which of those are missing the ethics/consent/compensation disclosures their venue's own policy requires.

## Problem

A venue's policy says human-subjects work must carry an ethics approval statement. Nobody checks at scale — chairs handle 3,000 submissions with volunteer labor, and reviewers aren't asked to. The result is a large fraction of published HCI/VIS work with participant studies and no approval statement anywhere in the text, which is a retraction liability the venue eats years later. The check is mechanical, boring, and nobody's job — the exact shape of a service people pay for.

## How it works

1. Chairs upload a batch (PDFs, or a CMT/HotCRP/OpenReview export via API).
2. For each paper the system answers four questions and shows the evidence span for each:
   - **Does this involve human participants?** ("We recruited 24 participants…", "12 experts completed…", crowdworker mentions, interview transcripts)
   - **Is there an approval statement?** (IRB / REB / ethics committee / "exempt determination" / explicit national equivalents — and the many venues where "our institution does not require" is a valid answer)
   - **Is consent described?**
   - **Is compensation stated, and what's the implied hourly rate?** (Prolific/MTurk amounts ÷ stated task duration — a number chairs currently never see)
3. Output: a ranked queue, a per-paper one-pager, and a CSV. Chairs act; the tool never rejects anything.
4. Second product line: a self-serve author pre-check, and a retrospective audit of a venue's back catalogue — the sales demo writes itself.

## Technical approach

Python. GROBID for PDF→TEI (it gives clean section segmentation, which matters — the signal is concentrated in Methods and the acknowledgments/back matter). Then a two-stage classifier: cheap high-recall regex/keyword gates over ~200 ethics-vocabulary variants in 6 languages to shrink candidates, then an LLM extraction pass constrained to a JSON schema (`{human_subjects: bool, n_participants: int|null, approval_stmt: {present, span, body_named}, consent: {...}, compensation: {amount, currency, duration_min}}`) run only on the gated spans, with mandatory verbatim evidence spans so every flag is auditable.

Calibration set: hand-label ~400 papers from open proceedings (ACM DL open-access subset, arXiv HCI). Target high recall on "has participants" and high precision on "approval statement missing" — a false accusation is far more costly than a miss, so tune the threshold hard toward precision and route the rest to "unclear."

Hardest part is not the NLP, it's policy pluralism: approval requirements differ by country and institution, and "no statement" ≠ "no approval." The product must present findings as *disclosure gaps*, never misconduct.

## v1 scope

- CLI over a folder of PDFs, CSV out
- Only questions 1 and 2 (participants + approval statement)
- English only
- One venue's policy hardcoded

## Out of scope

- Verifying an approval is real; plagiarism/image forensics; reviewer-facing UI; integration with any submission system.

## Risks & unknowns

- Do chairs have budget, or is this a volunteer-run venue with $0? Real buyer may be the publisher (ACM/IEEE) or the university, not the conference.
- Reputational blast radius if a flag is wrong and leaks.
- Publishers may build this in-house — that's also the acquisition path.

## Done means

On a held-out set of 100 labeled papers, recall on "involves human participants" ≥ 0.95 and precision on "approval statement absent" ≥ 0.95, and one real program chair runs it over a live submission batch and acts on the queue.
