## Overview
Mother Tongue is a one-round writing game for a TV and four phones, for people who like language games and are sick of "be funny, get voted for." Each phone is secretly dealt a 150-word CORPUS SCRAP in a sharply distinct register — a 1912 seed catalog, NBA post-game quotes, a software EULA, city council minutes. The host shows one neutral sentence stem. Everyone writes a continuation. Then every phone scores every continuation under its *own* private corpus, and your score is the **margin**: how much less surprising your line is to your corpus than to everybody else's. You are hunting shibboleths — phrasing that is utterly unremarkable in your world and alien in all the others.

## Problem
Perplexity is treated as a leaderboard number on a benchmark page. But cross-entropy under a *conditioned* model is literally "how much does this sound like home" — and that's a social quantity: dialect, register, in-group. Nobody has made that measurement into a table game, and crucially it can't be measured by one device, because the interesting signal is the *disagreement between differently-conditioned instruments*.

## How it works
**Host screen (public):** the stem ("After the third week, it became clear that…"); a 60-second writing clock; then the reveal — each line shown one at a time above a four-bar chart of bits/token under Corpus 1–4, labels masked. The room guesses aloud which bar is whose. Then the corpora unmask and margins resolve into scores.

**Each phone (private):** your corpus scrap, scrollable and readable only by you; a compose box with a live *own-corpus* surprisal meter that updates as you type ("3.9 bits/token — sounds like home"); nothing at all about anyone else's corpus. You are flying half-blind: you can see how native your line is, never how foreign.

**Scoring:** `margin_i = mean_{j≠i}(bits/token under corpus j) − (bits/token under corpus i)`. This objective is self-policing. A generic line scores low everywhere → margin ≈ 0. A merely weird line scores high everywhere → margin ≈ 0. Only genuine register-markers — "hardy and free-flowering," "the motion carries," "we as a group need to be better" — open a gap. Highest margin wins the round.

## Technical approach
PartyKit Durable Object per room, authoritative: `{stem, corpora: {playerId → text}, lines: {playerId → string}, matrix: number[4][4], phase}`. The host tab is the model oracle (transformers.js). Corpora are dealt by the server and forwarded to the oracle as blobs that are *never rendered* — an honest caveat: anyone who opens the host laptop's devtools can cheat, and the real fix is a server-side ONNX runtime, which is the v2 move.

Sync is coarse and easy: one barrier at the end of writing, then a scoring fan-out. Each corpus prefix is KV-cached once at round start; scoring is then 4 lines × 4 corpora = 16 short teacher-forced passes of ~25 tokens each, reusing cached prefixes. Live per-keystroke meters are debounced to 400ms and use only the author's own cached prefix.

The genuinely hard part is **calibration**, not sync. A 150-token prefix barely bends distilgpt2's distribution, so margins can vanish into noise. Mitigations: pick maximally distinctive corpora; report bits/token to kill length bias; z-score each line across the four corpora so the metric measures *relative* fit; and if that still doesn't separate, step up to Qwen2.5-0.5B-Instruct with an explicit register instruction prepended, which responds far more sharply to conditioning.

## v1 scope
- 4 players, one stem, one round, one winner. Hardcoded room code.
- Four hand-authored corpus scraps shipped as static strings. No corpus picking.
- 60s write, 240-char cap, one continuation each.
- Reveal: bar chart with masked labels, then unmask, then margins. No voting, no rematch.

## Out of scope
User-supplied corpora; "guess whose corpus" as a scored phase; multi-round play; >4 players; phone-side inference; persistence or profiles; any generation at all — the model only ever *scores*.

## Risks & unknowns
Margins may be within noise on a tiny model, which would make the game feel arbitrary — this is the make-or-break and needs an offline calibration harness before any UI work. Register-hunting may reward a narrow "good at pastiche" skill and flatten for everyone else. Bits/token is not intuitive; the UI has to translate it into hot/cold language without lying about it. Model download size on the host tab (~80MB int8) makes cold start slow.

## Done means
Four phones each show a different private corpus; each player's compose box shows a live own-corpus bits/token that visibly drops when they write in-register; after the barrier the TV renders a 4×4 surprisal matrix as masked bars; at least two of four lines produce a margin above the offline-measured noise floor; and the room can correctly guess at least one corpus from its bar pattern alone.
