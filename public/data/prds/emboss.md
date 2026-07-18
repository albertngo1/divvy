## Overview
Emboss is a desktop/web tool for Teachers of the Visually Impaired (TVIs) and Braille transcribers that turns a chart image or CSV into a tactile graphic ready to send to a swell-paper printer or Braille embosser. It automates the 80% case of a workflow that is currently entirely manual and hours-long per graphic.

## Problem
Blind students need tactile versions of the charts in their textbooks and worksheets. Producing them is a craft: a TVI redraws the figure, strips color (which means nothing by touch), substitutes distinct line textures and area fills, spaces everything so fingers can distinguish adjacent features, and transcribes every label into Braille following BANA/tactile-graphics guidelines. This is done in Illustrator or on a swell-form machine, one graphic at a time, and skilled transcribers are scarce and backlogged. The arxiv work on conversational/refreshable tactile data interfaces underlines the demand and the gap on the authoring side.

## How it works
1. Import: upload a chart image (or a CSV/data table for clean re-rendering).
2. Parse: detect chart type, series, axes, gridlines, and text via CV + OCR; or render directly from the table.
3. Transform: apply tactile rules—remove color, assign each series a distinct line dash/area texture from a legibility-tested set, enforce minimum feature spacing, thin dense gridlines, and simplify curves.
4. Braille: transcribe labels/legend to Unified English Braille via liblouis; place them with tactile spacing and a texture key.
5. Export: BRF for embossers and a print-and-swell SVG/PDF at correct physical scale; a side-by-side visual preview for the sighted TVI to sanity-check.

## Technical approach
Stack: Python + FastAPI backend, React frontend. CV/OCR: OpenCV + Tesseract/PaddleOCR for image imports; direct rendering path for CSV. Braille: liblouis (UEB tables). Vector output: svgwrite/CairoSVG at physical mm scale; BRF via a graphics-braille profile. Data model: a normalized `TactileGraphic` (marks, textures, label anchors, physical bounds) that both exporters consume. Key algorithms: texture assignment as graph-coloring over adjacency so touching regions never share a fill; feature-spacing solver that nudges marks to satisfy minimum tactile separation; curve simplification (Ramer–Douglas–Peucker) tuned to fingertip resolution. Hard part: making density-reduction and spacing choices that stay *faithful* to the data while remaining legible by touch—getting that heuristic right is the whole product.

## v1 scope
- Bar and line charts only.
- CSV/table import path first (skip CV); image import as stretch.
- Fixed texture palette of 4 tested fills + UEB label transcription.
- Export BRF + scaled SVG for one common embosser model.

## Out of scope
- Scatter/pie/maps, 3D, animation.
- Auto-generating alt-text prose.
- Cloud multi-user accounts, LMS integration.

## Risks & unknowns
- Tactile-legibility rules are guideline-heavy and somewhat subjective; needs a real TVI in the loop to validate.
- Embosser BRF-graphics formats vary by device.
- OCR on textbook scans is noisy—hence CSV-first.

## Done means
Given a 5-series line chart CSV, Emboss outputs a BRF that a Braille embosser prints, and a TVI confirms a blind reader can distinguish all series and read every label by touch without edits.
