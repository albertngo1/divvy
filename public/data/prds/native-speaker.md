## Overview

Native Speaker is a macOS menu-bar tool that treats you as a bilingual speaker of two closely related languages — Spoken You and Written You — and mines a parallel corpus between them from work you were already doing. It then offers a reverse translator: paste polished text, get it back sounding like you said it out loud.

## Problem

Everyone who writes talks, scripts, voice memos, podcast intros, or wedding toasts hits the same wall: written-register prose read aloud sounds like a press release. The usual fix is "write like you talk," which is useless advice because you cannot hear your own written voice. Meanwhile the one dataset that would solve this — thousands of aligned pairs of *the same thought* in both registers — is being generated and thrown away every time someone dictates a draft and then edits it.

## How it works

1. **Capture.** Whenever you use dictation (system dictation, Wispr-style tools, or the app's own hotkey), it stores the verbatim ASR transcript with disfluencies intact.
2. **Alignment for free.** It then watches the same text field / document for the edited final version. Dictation-then-edit gives a near-perfect alignment pair with zero extra user effort — this is the whole trick.
3. **Edit taxonomy.** Each pair is token-aligned and every edit is classified: `filler_delete` (um, like, sort of), `hedge_delete` (I think maybe), `lexical_upgrade` (got → received), `syntax_reorder` (right-dislocation flattened), `connective_swap` (so → therefore), `contraction_expand`, `repair_collapse` (false start removed).
4. **Phrasebook.** After ~40 pairs you get a two-column report: *You only ever say this* / *You only ever write that*, ranked by lift. It is uncomfortably specific and that is the point.
5. **Reverse gear.** "De-register" a passage: apply your learned edit distribution backwards, re-injecting your own contractions, connectives, sentence-shortening, and characteristic hedges — sampled from *your* table, not a generic casual-tone prompt.

## Technical approach

Swift menu-bar shell + Python core. ASR: `whisper.cpp` with `large-v3-turbo` locally, `--no-suppress-blank` and word timestamps so fillers survive (most dictation tools strip them, which destroys the signal — configure for verbatim). Alignment: Needleman-Wunsch over spaCy tokens with a lexical-similarity substitution score, producing an edit script. Classification: rules first (a filler lexicon, a hedge lexicon, contraction tables, POS-based reordering detection via spaCy dependency arcs), with a Claude call only for the residual "unclassified" bucket — cheap, since 80% of edits are mechanical. Storage: SQLite, `pairs(spoken, written, ts, source_app)` + `edits(pair_id, type, from_span, to_span)`. Reverse rewriting: a Claude prompt whose *context is the phrasebook itself* — 30 concrete extracted rules and 8 verbatim example pairs — which beats any generic "make this casual" instruction because the evidence is yours. The hard part is alignment quality when the edit is a heavy rewrite rather than a touch-up: gate on normalized edit distance and discard pairs above ~0.6, which loses data but keeps the taxonomy honest.

## v1 scope

- Hotkey: record → verbatim transcript into clipboard, remember it
- A single "pair this" action after you finish editing that block
- Filler/hedge/contraction classes only
- One report: top 25 phrasebook rows

## Out of scope

Auto-detecting the edited version without user confirmation, Windows/Linux, iMessage or Slack scraping, voice cloning or TTS, multi-user.

## Risks & unknowns

Alignment may fail on heavy rewrites often enough that pair yield is low. Verbatim ASR of your own fillers is a genuinely unpleasant thing to read and may make the tool feel hostile. Always-on audio is a privacy line — it must be hotkey-only, local-only, with a visible recording indicator.

## Done means

After 40 dictate-then-edit pairs, the phrasebook surfaces at least 10 rules the user rates "yes, that's actually me," and blind-testing three de-registered paragraphs against three originals, the user prefers the de-registered version for read-aloud use at least twice.
