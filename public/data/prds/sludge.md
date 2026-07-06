## Overview
Sludge is a browser puzzle roguelike about hostile interfaces, for anyone who has ever rage-quit a cancellation flow. Each level is a fake app screen whose sole rule is that no button does what its label says. You have one mundane goal — *unsubscribe*, *delete account*, *decline the trial* — and the UI is an adversary.

## Problem
The #1 Lobsters post this week was 'If you're a button, you have one job.' Dark patterns are a shared cultural sore. There's no toy that lets you *fight back* against sludge in a bounded, winnable arena — and turning the frustration into a scored game is cathartic and a little mischievous.

## How it works
You're dropped into a screen with a stated objective. Buttons are mislabeled ('Cancel' saves your card; 'No thanks' subscribes you). Modals confirm-shame ('Are you sure? You'll lose your streak of 0 days'). The real target button drifts a few pixels when you approach, or greys out until you've dismissed three upsells. Each level is timed; wrong clicks add a penalty and spawn a new nag. Clear it and you draw the next, harder screen from a procedural deck. A run is 8 screens; dying (running out of patience meter) ends it, roguelike-style, with a shareable score and the meanest pattern you survived.

## Technical approach
Pure client-side: TypeScript + a tiny state machine per screen, no backend. Screens are declarative JSON specs — a list of elements with a `trueAction` and a `labelText` that need not agree, plus modifiers (`driftOnHover`, `disabledUntil`, `spawnsNagOnMiss`, `confirmShame`). A seeded PRNG (mulberry32) builds each run's deck from ~20 base templates × modifier stacks, so daily seeds are shareable Wordle-style. Rendering is plain DOM/CSS because the *point* is real UI affordances — the drift and grey-out are CSS transitions on real `<button>`s. The genuinely hard part is difficulty curve tuning: too honest is boring, too adversarial is unfair, so each modifier carries a 'cruelty' weight and the deck-builder caps total cruelty per screen.

## v1 scope
- 6 screen templates, 5 modifiers
- One goal type (unsubscribe)
- Patience meter + miss penalties
- Daily seed + shareable emoji score

## Out of scope
- Accounts, leaderboards
- Mobile touch tuning
- Level editor / user-submitted sludge

## Risks & unknowns
- Fine line between 'clever' and 'infuriating' — needs playtesting
- Accessibility irony: a game about bad UI must itself be keyboard/screenreader navigable, or it's hypocritical (and unwinnable for some)
- Could feel one-note after 3 runs without fresh modifiers

## Done means
A stranger loads the page, is given 'unsubscribe from Newsletter,' fails at least once to a mislabeled button, then completes an 8-screen run and gets a shareable score string — all with zero network calls after load.
