## Overview
A CLI and editor plugin that reads your app's string catalog plus the components that render it, and flags every label where a user cannot tell state from action. "Mute", "Hide replies", "Block", "Disable notifications" — is that the current setting or the button that changes it? Aimed at the person who owns UI copy in a codebase and gets bug reports that read "the mute button is backwards."

## Problem
Grammar checkers work on prose. Nobody lints the 4,000 fragments in `en.json`, which is where the ambiguity actually hurts. English's zero-derivation makes it uniquely bad here: `mute`, `block`, `pin`, `star`, `filter`, `record` are all verb and adjective/noun with no morphological difference. German and Japanese translators must pick one, so the same key ships as an imperative in one locale and a state in another — the catalog already contains the evidence that the string was ambiguous, and nobody reads it.

## How it works
`npx amimuted src/` does three passes:
1. **Bind strings to controls.** Parse `.tsx`/`.vue` with the TypeScript compiler API / `@vue/compiler-sfc`, walk the JSX tree, and find every `t('key')` whose nearest enclosing element is stateful — `<Switch>`, `<Checkbox>`, a button with `aria-pressed`/`aria-checked`, a menu item with `role="menuitemcheckbox"`. Those are the only strings that can be ambiguous, which cuts 4,000 down to ~80.
2. **Classify the string.** POS-tag with `wink-nlp` and cross-check a WordNet lexicon: a single content word carrying both a verb sense and an adjective/noun sense, sitting on a stateful control, is rule `AMB001`. Rule `NEG002` catches negative-polarity toggles ("Disable X" with an on/off switch — off means enabled, the double negative everyone fails). `PAIR003` catches a label that changes text on toggle ("Mute"/"Unmute") where the accessible name and visible name disagree.
3. **Translation forensics.** For each flagged key, read the other locales already in the repo. If the German value is an infinitive verb (`-en` ending on a known verb stem) while the Spanish is a past participle (`-ado/-ada`), the translators disagreed about what the string means. Report it as `SPLIT004` with both readings quoted — the most persuasive finding, because it is proof rather than opinion.

Output: `path/en.json:412 AMB001 "Mute" on <Switch> — reads as both action and state`, plus a suggested fix (separate the state indicator from the verb, or move to a two-state segmented control). `--format=sarif` for CI, and an LSP wrapper so squiggles show up in the JSON file itself.

## Technical approach
Node + TypeScript, zero network calls. Catalog adapters for flat/nested JSON, `.po` (gettext, msgid/msgctxt is a gift — `msgctxt` often already disambiguates), and Rails YAML. Data model: `{key, locale, value, callsites[], control_kind, rules_hit[]}`. WordNet ships as a bundled trimmed index (~2MB) so there is no Python dependency. The genuinely hard part is callsite binding — `t(dynamicKey)`, wrapper components, and translated props defeat naive AST walking, so v1 resolves only literal keys and reports its own coverage ("bound 71% of stateful labels") rather than silently missing them.

## v1 scope
- Flat `en.json` + `.tsx` glob only.
- Four rules: AMB001, NEG002, PAIR003, SPLIT004 (German + Spanish heuristics only).
- Text output with file:line, exit code 1 on findings.
- No autofix.

## Out of scope
Prose quality, tone, reading level, ICU plural checking, RTL layout, screenshots.

## Risks & unknowns
False positives on labels that are unambiguous in context will kill trust fast; the fix is to ship narrow and let people add `// amimuted-ignore`. Callsite binding across component libraries may be the whole project. Unclear whether teams will run a linter for copy at all — the SARIF/CI path is the wedge.

## Done means
Run it against a real open-source app's catalog and it surfaces at least three labels the maintainers agree are ambiguous, with under one false positive per ten findings.
