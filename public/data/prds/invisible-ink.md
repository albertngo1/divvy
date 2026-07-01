## Overview
Invisible Ink is a browser tool that reveals covert markings in text — the kind the front-page HN story alleges Claude Code embeds, plus the broader family of zero-width watermarks, unicode homoglyphs, and statistical token fingerprints. Paste text in, get a forensic overlay out. For journalists, researchers, privacy nerds, and anyone who wants to know if the thing they're about to publish is silently tagged. Mischievously, it also *strips* and *forges*.

## Problem
Model providers and enterprises increasingly embed provenance signals into generated text — some visible only under a microscope. Most are invisible in every normal editor: a zero-width joiner here, a Cyrillic 'а' there, a suspiciously regular cadence. You can't defend against, study, or even notice what you can't see. There's no lightweight, offline lens for "what's actually in these bytes?"

## How it works
Drop text into a textarea. Invisible Ink runs three passes and renders a highlighted overlay: (1) **Hidden characters** — zero-width spaces/joiners, bidi controls, variation selectors, tag characters, rendered as visible colored pills at their exact positions. (2) **Homoglyphs** — Latin/Cyrillic/Greek lookalikes flagged with their codepoints. (3) **Statistical fingerprint** — a heatmap of unusual whitespace regularity and a rough per-token surprisal curve hinting at machine cadence. A sidebar tallies findings and offers three buttons: *Clean* (strip all non-visible marks), *Diff* (show byte-level before/after), and *Forge* (inject a chosen zero-width pattern — for red-teaming your own detector).

## Technical approach
Stack: pure client-side, zero network — a single static page, TypeScript + a canvas/DOM overlay, deployable to GitHub Pages. Core is a unicode scanner over `Array.from(str)` (codepoint-correct) matching against curated ranges: `U+200B–200F`, `U+2060–206F`, `U+FE00–FE0F`, `U+E0000–E007F` tag block, plus a homoglyph confusables table (subset of Unicode's `confusables.txt`). Positions map back to character offsets for highlight rendering. The statistical pass computes whitespace-run entropy and, optionally, per-token surprisal via a tiny bundled n-gram model — enough to *hint*, not prove. The genuinely hard part is honesty about confidence: distinguishing a deliberate watermark from incidental unicode (emoji ZWJ sequences, legitimate Arabic/Hebrew bidi) without crying wolf, so findings are ranked by suspiciousness, not flagged binary.

## v1 scope
- Paste box + highlighted overlay for hidden/zero-width chars
- Findings tally with codepoints and positions
- One-click Clean + before/after byte diff
- Fully offline static page

## Out of scope
- Homoglyph and statistical passes (v2), Forge mode, file/PDF ingestion, browser-extension packaging, any claim of "this is definitely from model X."

## Risks & unknowns
- False positives on legitimate multilingual/emoji text could erode trust.
- Actual provider watermarks may be robust to naive stripping.
- Ethical edge: Forge mode is dual-use; frame as red-team tooling only.

## Done means
Pasting text containing an injected zero-width joiner and a Cyrillic homoglyph highlights both at the correct positions with codepoints listed; clicking Clean removes only the invisible marks and the diff proves the visible text is byte-identical otherwise; a clean paragraph of normal prose produces zero findings.
