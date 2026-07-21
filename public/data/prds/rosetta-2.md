## Overview
Rosetta is a room-of-phones party game sparked by AlphaOracle's oracle-bone-script decipherment: instead of an AI cracking an ancient logographic script, one human invents a fresh one and the rest of the table plays archaeologist. It's Codenames-adjacent but the shared secret is a *writing system*, and the tension is in a deliberately incomplete key.

## Problem
Most drawing/word party games are about a single instant of cleverness. Nobody has bottled the specific joy of *decipherment* — staring at unknown marks, leveraging a partial bilingual fragment, and inferring meaning by structure. It's a genuinely fresh mechanic that scales from 3 to 8 players.

## How it works
Each round one player is the **Scribe**. They're dealt a small vocabulary (say 8 concepts) and draw a glyph for each on a canvas — encouraged to reuse strokes as "radicals" so related concepts look related. The Scribe then composes a short message by sequencing glyphs under a simple grammar. Everyone else are **Archaeologists**: they see the message plus a **Rosetta fragment** — an auto-revealed subset of glyph→meaning pairs (chosen to expose some radicals but not the whole message). They privately submit a decoded translation. Scoring is Goldilocks: the Scribe earns points only if the message is *partially but not fully* decoded across the table — reward clarity without giving it all away. Archaeologists score per correctly recovered concept, bonus for cracking a compound glyph the fragment never showed.

## Technical approach
Web app, one host screen optional. Room codes via a tiny Node/WS server (or PeerJS) — state is small, mostly JSON messages and PNG glyph blobs. Glyph drawing is HTML canvas with pressure-agnostic strokes stored as vector paths (so radicals can be measured for a "visual similarity" hint later). Grammar is a fixed template (subject-verb-object slots) so the Scribe just fills glyph slots. The Rosetta-fragment selector is the clever bit: a small algorithm that reveals glyphs maximizing *inference potential* — expose radicals that appear in unrevealed compounds — tuned so rounds land in the sweet spot instead of trivial or impossible. Decipherment is human-adjudicated at reveal (players mark their guesses against the truth), sidestepping any NLP scoring.

## v1 scope
- 3–6 players, room code join
- Canvas glyph drawing, fixed 3-slot grammar
- Fragment auto-reveal + private guess submission
- Reveal screen with Goldilocks scoring, 5 rounds

## Out of scope
- Automated translation scoring / OCR of glyphs
- Persistent scripts across sessions
- Spectator/streaming mode

## Risks & unknowns
The fragment-selection tuning is make-or-break; too generous or too stingy kills the fun. Drawing on phones must feel fast, not tedious. Grammar simple enough to compose in 60s yet rich enough to decode.

## Done means
Five people in a room can play a full round: one draws a script, the rest decode from a partial key, and the reveal produces at least one "ohhh, that radical meant *water*" moment plus a coherent score.
