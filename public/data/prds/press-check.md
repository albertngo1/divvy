## Overview
Press Check is a pytest plugin and GitHub Action that tests generated PDFs the way you test code. It is for anyone whose product emits documents: invoice pipelines, LaTeX paper builds, resume products, statement generators, report exporters.

## Problem
PDF output regresses silently. Somebody widens a table column by 4 points and three months of invoices ship with the total overlapping a border, and you find out from a customer. The existing options are golden-image diffing (breaks on every font-rendering change, so teams delete it) or nothing (what most teams have).

## How it works
You write assertions in a test file:

```python
def test_invoice(pdf):
    pdf.page(1).assert_no_overlap(tolerance_pt=0.5)
    pdf.page(1).assert_within_margins(top=36, bottom=36)
    pdf.assert_no_clipped_glyphs()
    pdf.assert_fonts_embedded()
    pdf.page(2).assert_visually("the TOTAL row is bold and right-aligned")
```

Failures emit a PNG artifact with the offending boxes stroked in red and a one-line reason. CI fails; you look at one image.

## Technical approach
Python. `pypdfium2` for rasterization, `pymupdf` for the glyph-level content stream: every assertion in the deterministic tier works off word and glyph bounding boxes, never pixels.

- `assert_no_overlap`: build an R-tree (`rtree`) of glyph and vector-path boxes per page, report intersecting pairs above a tolerance, excluding known-benign cases (glyphs inside their own text run, fills behind text).
- `assert_no_clipped_glyphs`: compare each glyph box against the active clip path from the graphics state stack.
- `assert_fonts_embedded`: walk `/Resources /Font` for missing `/FontFile*`.

The fuzzy tier routes a 150 dpi page raster to Claude with a strict tool schema returning `{verdict, reason, boxes}`. Three things keep it out of CI-flake hell: (1) verdicts are cached keyed on `sha256(page_raster) + assertion_text`, so unchanged pages cost nothing; (2) three-vote self-consistency at temperature 0, majority wins; (3) an `unknown` verdict warns rather than fails — the model is never allowed to be the sole reason a build goes red on a page it has not confidently judged.

The genuinely hard part is rasterizer nondeterminism: font hinting differs between your laptop and the runner, so cache keys thrash. Solution is pinning the pdfium build inside the action's container and hashing the *text layer plus vector geometry* rather than pixels when computing the cache key.

## v1 scope
- Five deterministic assertions, one VLM assertion
- pytest plugin exposing a `pdf` fixture
- Failure PNG artifact with boxes drawn
- SQLite verdict cache committed to the repo

## Out of scope
DOCX/PPTX, HTML, auto-fixing layouts, a hosted service, PDF/A conformance.

## Risks & unknowns
The deterministic tier may be so useful the VLM tier is unnecessary — that would be a fine outcome but changes the pitch. Overlap detection is noisy on documents that legitimately layer marks (stamps, watermarks); the tolerance and exclusion rules need real-document tuning. Many teams simply have no PDF in CI to point this at.

## Done means
Take a real invoice template, widen one column by 4 pt, push. CI goes red with a PNG showing exactly the two overlapping cells outlined, and the unchanged pages cost zero API calls.
