## Overview
Tailgate is a 3–6 player concurrent-room party game about writing a sentence that flows gracefully after *anything*. Each player writes one line blind; the host then secretly chains everyone into a ring and scores each line by its perplexity **conditioned on the previous player's line** — which you never saw when writing. The skill is crafting a universally-followable opener. For groups who like word games with a hidden-structure reveal.

## Problem
Conditioning games so far (Pretext) let you craft the context you're judged against. Tailgate inverts it: the context is a secret someone else wrote, and you have to be robust to it. That's a different, funnier tension — you're writing to survive an unknown predecessor, and unknowingly setting a trap for the next person.

## How it works
The host TV shows a loose shared topic ('a dinner party') and a 60-second timer. **Privately, each phone** shows a single text box: write one sentence, blind, no meter, no hints — you cannot see anyone else's line. On submit the phone locks.
The **host** secretly assigns a random ring order (P1→P2→…→Pn→P1). For each player it forms the pair `[predecessor's sentence] + [your sentence]` and runs distilgpt2 to compute the perplexity of *your* tokens given the predecessor as context. Low conditional perplexity = your line felt like a natural continuation of whatever came before. Your own line simultaneously becomes the hidden context the NEXT player was judged against.
Reveal is the payoff: the host TV walks the ring one junction at a time, showing predecessor→you with the junction's conditional-perplexity score, so the room watches which non-sequiturs clanged and which lines glided in after absurd setups. Lowest total conditional perplexity wins 'Most Followable.' A booby-prize goes to whoever wrote the predecessor that wrecked the most people.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Objects, or Socket.IO over Tailscale Serve). Model: distilgpt2 via transformers.js, host-side only — phones just collect text, so there's no live meter to leak information (which is intentional: blindness is the game). Data model: `Room{code, topic, phase, ringOrder[]}`, `Player{id, name, sentence, condPerplexity}`. Sync: trivial — collect N strings, then host computes N conditional-perplexity passes sequentially. The genuinely hard part is *scoring fairness*: conditional perplexity is length-sensitive, so the host length-normalizes per-token, and must handle tokenizer boundary effects at the predecessor/self seam (score only the self-tokens, with the predecessor as a fixed prefix in the same forward pass).

## v1 scope
- One round, 3–6 players, one shared topic.
- Blind single-sentence authoring, no phone-side meter.
- Host builds one random ring, scores conditional perplexity per junction.
- Ring-walk reveal + 'Most Followable' winner.

## Out of scope
- Multiple rounds, cumulative scoring.
- Player-chosen ring order or strategy over predecessors.
- Any live feedback while writing.

## Risks & unknowns
- Players may find 'write to follow anything' abstract until they see one reveal — onboarding line matters.
- Short generic lines ('That was nice.') may dominate; may need a min-length or content-word requirement.
- Ring randomness means variance is high with only one round.

## Done means
Five phones submit one blind sentence each; the host silently forms a ring, computes each line's per-token conditional perplexity given its secret predecessor, and the reveal walks all five junctions showing scores, with a reproducible lowest-conditional-perplexity winner and a distinctly higher-scoring non-sequitur visibly called out.
