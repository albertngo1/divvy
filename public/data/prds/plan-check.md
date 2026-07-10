## Overview
A web tool for small general contractors, architects, and permit expediters who cycle building-permit applications through municipal plan review. It ingests the scanned "plan check correction letter" a city sends back, extracts each numbered comment, and tracks the response/resubmittal loop until the permit is issued.

## Problem
Municipal plan review is a black box of PDF ping-pong. A jurisdiction returns a correction letter with 40 numbered comments across building, mechanical, electrical, and fire disciplines. The contractor must respond to each, mark up the drawings, resubmit, and then reconcile the *next* round's letter against the last — figuring out which comments were cleared, which persist, and which are brand new. Today this is done in a spreadsheet and a prayer. Comments get missed, cycles balloon, and every extra round is weeks of carrying cost on a stalled job.

## How it works
1. Upload the correction letter PDF (and optionally the plan set).
2. The tool OCRs and splits it into discrete comments, each tagged with discipline, code section cited, and page reference.
3. You write a response per comment and mark it addressed; the tool bundles a clean "comment-response matrix" PDF to submit back.
4. On the next round's letter, it fuzzy-matches new comments against prior ones and shows a diff: Cleared / Still Open / New. A cycle-count and days-in-review timer accrues per permit.
5. A dashboard shows every active permit's stage, open-comment count, and which discipline is the bottleneck.

## Technical approach
Stack: Next.js + Postgres + a Python worker. PDF text extraction via `pdfplumber`; fall back to Tesseract/`ocrmypdf` for scanned letters. Comment segmentation keys off the near-universal numbered-list structure (`1.`, `2.1`, discipline headers) with a regex + layout heuristic, then an LLM pass (structured JSON output) to normalize discipline, cited code section (IBC/IMC/NEC references), and severity. Data model: `permits → review_cycles → comments (status, discipline, code_ref, response_text)`. Cross-cycle matching uses embedding cosine similarity plus code-reference exact-match as a tiebreaker. The genuinely hard part is reliable comment matching across rounds when reviewers reword or renumber — that's where the embedding+code-ref hybrid earns its keep.

## v1 scope
- Single jurisdiction format, single user.
- Upload letter → extracted comment list you can hand-correct.
- Response text per comment → exported response-matrix PDF.
- Two-cycle diff (Cleared/Open/New) on the next upload.

## Out of scope
- Direct e-permitting portal integration (Accela, etc.).
- Drawing/sheet markup rendering.
- Multi-user roles, billing, notifications.

## Risks & unknowns
- Correction-letter formats vary wildly by city; extraction may need per-jurisdiction tuning.
- OCR quality on faxed/scanned letters.
- Whether expediters will trust an auto-diff enough to stop keeping their spreadsheet.

## Done means
Upload two consecutive real correction letters for one permit; the tool produces a comment list that a user corrects in under 5 minutes, and the second-round diff correctly classifies ≥80% of comments as Cleared/Open/New without manual re-linking.
