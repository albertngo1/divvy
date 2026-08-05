## Overview
A browser extension and CLI that reads any prose you're writing and annotates its metaphors by conceptual source domain, not just by "is this a cliché." It flags mixed-domain collisions inside a sentence, and renders the whole document as a stripe chart of its metaphor diet — the moment where a manager discovers their strategy memo is 61% warfare is the product. For anyone who writes to be read: memo-writers, technical writers, newsletter authors, editors.

## Problem
Every style checker does the same two things: flag passive voice and flag clichés from a static list. Neither notices that "we need to circle back before we move the needle on this low-hanging fruit" has yanked the reader through a nautical maneuver, a laboratory dial, and an orchard in eleven words. Mixed metaphor is the single most common way otherwise-competent business and technical prose becomes unreadable mush, and no tool detects it, because detecting it requires knowing what each idiom is *about* — not just that it's overused. Separately, nobody can see the shape of their own rhetoric; writers who lean 60% on war framing have no idea they do it.

## How it works
1. You write in Google Docs, a textarea, or a Markdown file.
2. The linter matches idioms and dead metaphors against a lexicon where every entry carries a source domain: WAR, SAILING, HUNTING, FARMING, CARDS, SPORT, MACHINERY, MEDICINE, THEATRE, COOKING, CONSTRUCTION, JOURNEY, ANIMAL, MONEY.
3. Matches get a faint underline tinted by domain. Hovering shows the literal image: "low-hanging fruit → FARMING, literally: fruit near the ground."
4. Collision rule: two or more distinct source domains within one sentence, or within a 15-word window, fires a warning showing the literal scene it accidentally describes. That absurd literal reading is the fix — you don't need to be told it's wrong, you just need to see it.
5. A sidebar shows the document as a horizontal stripe chart, one stripe per matched idiom in reading order, colored by domain, with a summary: "WAR 41% · SPORT 22% · MACHINERY 18%."

## Technical approach
- Lexicon: bootstrap ~6,000 English idioms from Wiktionary's idiom categories plus the Oxford/Wordnik idiom lists, then label each with a source domain — a one-time Claude batch pass with human review of the ~800 highest-frequency entries, since the tail matters far less than the head. Ships as a static ~400KB JSON.
- Matching: lemmatize with a small WASM-compiled spaCy-equivalent (or compromise.js for speed), then run an Aho-Corasick automaton over lemma sequences with slot support for inflected verbs and pronouns ("move the needle" / "moved the needle" / "moving his needle"). Fully local, no network, no LLM at runtime — that's what makes it fast enough to run on every keystroke and safe enough for confidential drafts.
- Collision detection: sentence-split, group matches by sentence, warn when the distinct-domain count ≥ 2 and the domains aren't in a small allowlist of compatible pairs (JOURNEY+SAILING reads fine; WAR+COOKING does not).
- Data model: `{phrase, lemmas[], domain, literalGloss, deadness: 0-1}` where deadness marks metaphors so fossilized nobody hears them anymore ("deadline," "grasp an idea") and which should be excluded by default from collision math.
- Hard part: the deadness threshold. Flag too aggressively and every sentence in English lights up, because English is metaphor all the way down. Getting the default so that a clean paragraph shows zero warnings is the entire calibration problem.

## v1 scope
- CLI only: `deadmetaphor draft.md` prints annotated lines and the domain histogram.
- 800 hand-labeled high-frequency idioms, 8 source domains.
- Collision warning at ≥2 domains per sentence.

## Out of scope
- Browser extension, Google Docs add-on, rewrite suggestions, non-English, live stripe chart UI.

## Risks & unknowns
- Deadness calibration may be unfixable with a single global threshold; might need per-genre profiles.
- Some mixed metaphors are deliberate and good; the tool must warn, never autocorrect.
- Wiktionary idiom coverage is uneven and its licensing needs checking for redistribution.

## Done means
Running it on a real corporate strategy memo produces at least one collision warning that makes the author laugh out loud, and running it on a page of well-edited New Yorker prose produces zero.
