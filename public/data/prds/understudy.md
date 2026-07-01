## Overview
Understudy is a quiet, real-time-paced single-player game for people who liked the melancholy of Endling or the ritual of a slow sim. You are the apprentice to the last living master of a fading craft (inspired by the two remaining Tokyo barley-tea makers). You don't buy skills from a tech tree — you learn them the way real crafts are transmitted: by watching, imitating, and being corrected, before it's too late.

## Problem
Most crafting games treat mastery as a progress bar you grind at will. They miss the actual stakes of dying knowledge: it's not that skill is hard to *earn*, it's that it's about to be *gone*. There's no game where forgetting is the enemy and the teacher is mortal.

## How it works
The master demonstrates a technique as a short sequence (roast, grind, steep — a rhythm/timing minigame). You watch, then attempt to reproduce the sequence from memory; the master critiques and your fidelity score creeps up over repeated real sessions. Crucially, the master ages — say one in-game year per real week — and their hands get less steady, so demonstrations degrade over time. When they pass, any technique still below "mastered" is struck from your recipe book permanently (this save can never make that tea again). Your ending is the set of crafts you managed to carry forward — and an apprentice of your own you can pass them to.

## Technical approach
Stack: web game, TypeScript + PixiJS or plain Canvas, LocalStorage/IndexedDB save. Core model: `Technique {steps[], masteryFloat, degradation}` and a `Master {age, steadiness}` whose steadiness multiplies demonstration timing jitter. The learning loop is a timing/sequence match — score = DTW (dynamic time warping) distance between the player's input tap timings and the target rhythm, so "close but off" reads as "almost." Real-time aging via wall-clock deltas persisted across sessions (compute elapsed on load, no background process). Hard part: tuning the mortality/mastery curves so loss feels earned and poignant, not cheap — and making "watching" feel active, not passive.

## v1 scope
- One craft, three techniques
- Watch → imitate → get-scored loop with DTW timing match
- Master ages on wall-clock; one technique lost on death if unmastered
- A single somber ending screen listing what you saved

## Out of scope
- Multiple crafts, economy/selling, story branching
- Training your own apprentice (the sequel hook)
- Audio-heavy production, 3D

## Risks & unknowns
Slow real-time pacing can read as "nothing to do"; DTW scoring on touch/click timing may feel fiddly; the permadeath-of-knowledge hook is emotionally sharp but easy to make frustrating.

## Done means
I can watch a technique, imitate it three times with improving scores, close the tab, return two days later to find the master visibly older and his demo shakier, and — if I dawdle — see a technique permanently removed from my recipe book on his death.
