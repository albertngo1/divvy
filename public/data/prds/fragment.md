## Overview
Fragment is a daily shader-golf puzzle. Every day at midnight UTC, a target image drops. Players write a GLSL fragment shader in-browser to recreate it as closely as possible, and are scored on a mix of visual similarity and code brevity. Fewest characters + closest match wins. For graphics programmers, demoscene fans, and anyone who wanted to learn shaders but needed a reason.

## Problem
Shadertoy is a sandbox, not a game — infinite scope, no shared goal, no reason to come back at a specific time. Learning shaders lacks a daily, competitive, bite-sized on-ramp with a clear win condition.

## How it works
One shared target image per day. You edit a fragment shader in a Monaco editor with a live WebGL preview. A 'similarity' meter (per-pixel difference) shows how close you are; a character counter tracks golf length. Submit to lock in your score = f(similarity, length). Results reveal a leaderboard and, crucially, everyone's submitted source — so the real payoff is reading how the top golfers pulled off that gradient in 80 chars. Streaks and a monthly aggregate keep people coming back daily.

## Technical approach
Stack: SvelteKit front end, WebGL2 for the preview, Monaco for editing, tiny serverless functions + Postgres for daily puzzles and scores. Scoring: render the user's shader to an offscreen 256×256 framebuffer, read pixels via `readPixels`, compute mean-squared error against the target (also stored at 256×256). Final score = `similarity_weight * (1 - normalizedMSE) + brevity_weight * (1 - len/maxLen)`. Anti-cheat: recompute the score server-side by running the submitted shader headlessly (headless-gl / WebGL in a worker) so client scores can't be forged. Data model: `puzzles {date, target_png}`, `submissions {user, date, src, similarity, len, score}`. The hard part is trustworthy server-side re-rendering and defining a target set that's fun to golf (procedural gradients/patterns, not photos).

## v1 scope
- One daily target (hand-picked procedural images)
- In-browser editor + live WebGL preview + MSE meter
- Client-side scoring + daily leaderboard
- Reveal all sources after submit

## Out of scope
- Server-side anti-cheat re-render (v2)
- User-submitted targets
- Multi-pass / buffer shaders
- Accounts beyond a nickname

## Risks & unknowns
GLSL is a steep barrier — may be too niche for a daily habit. MSE is a crude similarity metric and gameable; may need perceptual weighting. Headless WebGL for anti-cheat is finicky.

## Done means
A visitor can write a fragment shader, see it render live against today's target, get a similarity+length score, submit it, and view a ranked leaderboard with everyone's revealed source code.
