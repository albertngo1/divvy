## Overview
Compost is a note app built as the deliberate inverse of tools like magic-context ('unbounded memory that manages itself, one session for life'). Instead of hoarding everything forever, Compost lets notes *decay* — and turns forgetting into a garden. For over-collectors drowning in a 5,000-note Zettelkasten they never revisit.

## Problem
Persistent memory is fashionable, but infinite retention is where knowledge bases go to die: everything is kept, nothing is trusted, search returns 200 stale hits. The scarce act isn't capturing — it's *deciding what deserves to survive*. No tool makes forgetting a first-class, satisfying mechanic.

## How it works
Every note has a freshness value that decays exponentially with a half-life (default 30 days). Opening, editing, or linking a note 'waters' it, resetting decay. The UI shows notes fading — vivid → sepia → wilted. When freshness hits zero, the note isn't deleted; it's *composted*: its text is stripped to salient keywords (its 'nutrients') and dropped into a soil pool. When you start a new note, Compost suggests seeds from the soil — surfacing themes from things you let go, so dead notes fertilize new thought instead of haunting a folder. A weekly 'harvest' view shows what's ripening and what's about to rot, forcing a triage ritual.

## Technical approach
Stack: a local-first desktop app (Tauri + SQLite, or a static PWA with IndexedDB) over a plain Markdown folder so notes stay portable. Data model: note {id, body, created, last_watered, links[]}; freshness = 0.5^((now − last_watered)/halflife). Composting extracts keywords via TF-IDF over your own corpus (so terms distinctive to *you* rank), stored in a soil table {term, weight, source_ids}. New-note seed suggestions rank soil terms by weight × recency-of-death. The genuinely hard part is the decay/keyword tuning that makes forgetting feel *wise* rather than punishing — too aggressive and you lose real work; the composting-to-keywords step is the safety net that must feel like distillation, not loss.

## v1 scope
- Markdown folder + freshness decay with a visible wilt gradient
- 'Water' on open/edit
- Compost at zero → TF-IDF keywords into a soil list
- Seed suggestions when creating a new note

## Out of scope
- Cloud sync / multi-device
- Backlinks graph visualization
- Configurable per-note half-lives (one global default for v1)
- Actual hard deletion — v1 never destroys body text, only hides it

## Risks & unknowns
People fear losing notes; the whole thing dies if composting ever feels like data loss, so the 'nothing is truly deleted' guarantee is load-bearing. Half-life tuning is guesswork without real usage. TF-IDF keyword quality on short notes may be weak. The metaphor could read as gimmicky rather than useful — needs the harvest ritual to deliver genuine triage value.

## Done means
A note untouched past its half-life visibly wilts and, at zero, appears composted with sensible extracted keywords; starting a new note offers at least one seed drawn from composted material; and no note's body is ever irrecoverably destroyed.
