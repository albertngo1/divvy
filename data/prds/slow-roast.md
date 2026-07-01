## Overview
Slow Roast is a small narrative craft game inspired by the Tokyo mugicha makers — a trade down to two practitioners. You inherit a roasting shop. The twist: it's built like an idle/incremental game (upgrades, automation, throughput) but every optimization you buy *degrades* the product. It's a game that punishes the reflexes idle games train. For people who love cozy craft sims and anyone tired of 'faster, smaller, more' as the only axis (a quiet jab at a tech feed full of 'modern replacements' and 'lite' models).

## Problem
Every incremental game teaches one lesson: automate, scale, optimize. Real craft is the opposite — patience, feel, refusal to cut corners. No game models the *cost* of optimization. Slow Roast makes 'the slow way' the only winning strategy and makes you feel the pull of the shortcut.

## How it works
Core loop: heat control over time. You roast batches by holding temperature in a narrow band with a manual dial; over/under-roast tanks a Flavor score. Customers return based on Flavor, building a Regulars stat that's your real currency. The trap: a shop of tempting upgrades — bigger drum, auto-agitator, gas burner, pre-crushed barley — each boosts Volume but applies a hidden Flavor penalty and drives Regulars away. A naive player scales up, watches revenue spike then collapse as regulars leave. The meta-game is discovering that Flavor > Volume, and that some upgrades (a better thermometer, a stool to sit on) help without cheating. A season timer ends with a verdict: did you keep the craft alive or turn it into a factory?

## Technical approach
Browser game, TypeScript + a lightweight canvas/DOM renderer (PixiJS or plain canvas). No backend; state in localStorage. Model: `Batch{roastCurve[], flavor}`, `Shop{volume, flavor, regulars, cash, upgrades[]}`. Roasting minigame samples your dial position vs an ideal temp curve each tick; Flavor = integral of time-in-band minus scorch penalty. Each upgrade carries `{volumeMult, flavorDelta, isCheat}`; Regulars follows a smoothed function of rolling Flavor. Hardest part: tuning the economy so the optimization trap is genuinely tempting (short-term revenue must jump) yet the slow path wins — playtesting the crossover point. Optional: a hand-drawn art pass and ambient roasting audio for cozy feel.

## v1 scope
- One roast minigame (dial vs curve)
- ~8 upgrades, ~half of them cheats
- Regulars/Flavor/Volume economy + one 12-day season
- End-of-season verdict screen

## Out of scope
- Multiple products or shops
- Story characters / dialogue trees
- Mobile touch tuning
- Save sync / accounts

## Risks & unknowns
- Economy tuning is the whole game; get it wrong and it's either obvious or unwinnable
- 'Anti-idle' may frustrate players expecting dopamine drip
- Manual roasting could feel tedious vs meditative — pacing risk

## Done means
A playtester can complete a full season two ways — a scale-up run that visibly collapses, and a slow run that keeps Regulars high — and reports the crossover felt like a real temptation, not an obvious trap.
