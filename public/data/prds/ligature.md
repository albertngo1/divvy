## Overview
Ligature is a weekend web tool that generates a custom OpenType/TrueType font carrying a hidden payload. Inspired by the QR-code-rendered-in-a-font demo and pure-JS barcode libraries, it lets you hide a message *in the typeface itself*: normal text reads normally, but a chosen trigger phrase substitutes into a QR code or secret glyph. It's for tinkerers, ARG makers, and CTF puzzle authors.

## Problem
Most steganography needs image files or special containers, which look suspicious and don't survive being pasted into a chat box. And zero-width-character tricks are well-known and easily stripped. There's a playful gap: hide data in a way that renders as *legible design*, where the font is the key and the carrier text looks like ordinary typography.

## How it works
You enter a payload (a URL, a short string) and a trigger word. Ligature builds a font where a GSUB ligature rule maps the trigger's glyph sequence to a single composite glyph whose outlines *draw* the payload — as a QR code (via a barcode lib) or a chosen shape. You download the `.otf` and a share snippet. Anyone viewing text set in that font sees plain letters until they type the trigger word, at which point it blooms into the scannable code. Decoding = point your phone camera at the rendered QR. The font ships as the secret; the visible document is innocuous.

## Technical approach
All client-side JS. Use `opentype.js` to author glyphs and tables, `bwip-js` (or a QR lib) to generate the module matrix, then rasterize each module into rectangle contours composited into one glyph. The GSUB table gets a ligature substitution: sequence `[t,r,i,g,g,e,r]` → the payload glyph; contextual alternates keep normal typing untouched. Data model is just the font-build spec: `{payload, trigger, gridSize, baseFont}`. The genuinely hard part is hand-authoring valid GSUB/`cmap` tables and turning a QR matrix into clean, correctly-scaled glyph outlines that render crisply at text sizes across browsers.

## v1 scope
- Payload → QR → single ligature glyph in a downloadable OTF
- One base font, one fixed trigger word
- Live preview textarea using the generated font
- 'Type the trigger to reveal' demo

## Out of scope
- Robust survival across copy-paste when the font isn't present (it won't — font is the key)
- Multiple payloads per font, encryption
- Windows font-cache edge cases

## Risks & unknowns
- GSUB/cmap authoring is finicky; browser font rendering varies
- QR outlines may not stay scannable at small point sizes
- 'Cute demo' more than 'useful tool' — needs a real use (ARG/CTF) to stick

## Done means
Enter a URL and trigger word, download the OTF, install it, type the trigger in any web-font-capable text field, and a phone camera successfully scans the rendered QR back to the original URL.
