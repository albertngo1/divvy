## Overview
Temperature Check is a 3–4 player hidden-agenda game where a small in-browser LLM generates one paragraph, token by token, on the shared screen — and the players *are* the sampler. Each phone owns one anonymous decoding dial and one secret entropy agenda. The measured entropy of the model's next-token distribution, per token, is the entire scoring engine.

## Problem
Everyone has now watched an LLM stream text. Nobody has ever had their hands inside it while it does. Temperature, top-p and repetition penalty are exactly the knobs that trade coherence for chaos — they are a tug-of-war waiting to happen, and the thing they trade is literally measurable in bits. A hidden-agenda structure makes that tug-of-war social instead of a settings panel.

## How it works
The host tab loads Qwen2.5-0.5B-Instruct (WebLLM/WebGPU, distilgpt2 as WASM fallback) and begins generating from a seed prompt — *"Write the opening of a customer complaint about a hotel."* — at a deliberate **one token every 700ms**, slow enough to read aloud.

**PRIVATE, on your phone:**
- Your DIAL — you are dealt exactly one of: temperature (0.2–2.0), top-p (0.3–1.0), repetition penalty (1.0–1.6). You drag it continuously for the whole stream.
- Your AGENDA card, seen only by you: *COLD — score a point for each token where entropy is under 2.0 bits*, or *HOT — a point for each token over 4.5 bits*.

**PUBLIC, on the TV:**
- The text streaming in, word by word
- A live entropy needle plus a scrolling entropy trace of the last 40 tokens
- Three **anonymously labelled** gauges — Dial A, Dial B, Dial C — visibly moving, but never attributed to a player

So the room can see that *something* was cranked hard at token 18 and the paragraph fell apart into "aaaaa", but not who did it, or whether they even wanted that. After 40 tokens the stream stops, agenda points are totalled, and every player privately submits one guess: which player held which dial, and were they hot or cold. Correct guesses score; the read-aloud of a paragraph three people were fighting over is the payoff.

Per-phone is load-bearing three ways: continuous simultaneous control (one shared dial passed around is not a tug-of-war), private agendas, and unattributed ownership.

## Technical approach
Host tab is the only inference site; phones are thin PWA controllers. Authoritative Socket.IO server over Tailscale Serve holds knob state; the **token tick is the clock**, which dissolves most real-time sync pain — we need knob values correct at 700ms boundaries, not sub-100ms.

Per tick the host pulls `knobs@T` (server drops any update arriving inside the last 250ms into the next tick), then applies a fixed pipeline: repetition penalty → temperature → top-p truncate → renormalize → **measure Shannon entropy of the final distribution** → sample. Entropy is measured post-pipeline, so every dial genuinely moves the score. The host echoes `{token, entropyBits, appliedKnobs}` back so the TV gauges show exactly what was applied, not what was requested.

Data model: `Room{seed, tick, tokens[], entropy[]}`, `Player{id, dialType, dialValue, agenda:'HOT'|'COLD', points}`, `Guess{playerId, assignments}`. Hard part: the interaction between dials — top-p truncation can crush the entropy a maxed temperature was buying, so a player can be silently neutralized by another. That may be delicious or may feel arbitrary; the applied-value echo exists to make it at least legible.

## v1 scope
- 3 players, one 40-token stream, one hardcoded seed prompt
- Two agendas only (HOT / COLD), fixed thresholds 4.5 / 2.0 bits
- Three dials, one per player, dealt randomly
- TV: text + entropy needle + three anonymous gauges; end-screen totals
- One private guess round, one scoreboard, done

## Out of scope
- Multiple rounds, prompt choice, swing/oscillation agendas, ban lists
- Audience voting, reconnect, WASM fallback polish, model switching

## Risks & unknowns
- Causality opacity: if players can't feel their dial affecting the needle, the game dies. Mitigation is the per-dial gauge and a 40-token trace, but this needs playtesting first.
- WebGPU availability on the host laptop; the WASM fallback may not sustain 700ms/token.
- Entropy thresholds are model-specific and must be calibrated by hand against real generations, or one agenda becomes free points.
- Top-p may dominate all other dials, making one seat strictly strongest.

## Done means
Three phones each hold a different dial; dragging a phone slider visibly moves the TV's entropy needle within one token tick; a 40-token paragraph completes with a per-token entropy log; agenda points computed from that log match a hand recount; and the end screen resolves each player's private guess into a final score.
