## Overview
A silent 5-minute word game for 4–6 people in one room with a TV and their phones. Each player is privately assigned one *other* player to impersonate. Everyone answers the same prompt as their target would. Nobody knows who is aiming at them. Because the assignments form a single closed cycle, the only stable solution — the fixed point of "match the next person" — is the whole room landing on one answer. Convergence is not the instruction; it's the emergent equilibrium.

## Problem
Matching games (Wavelength, Herd Mentality, Medium) aim everyone at the same public target, so the whole game is "guess the obvious answer." The itch: make matching *directed and asymmetric*, so each player is solving a different, second-order problem — "what would Dana write, given Dana is writing as somebody I can't see?" — and let unanimity fall out of that knot instead of being asked for.

## How it works
1. Server computes a random single-cycle derangement of the players.
2. **Private on your phone only:** "You are secretly playing as **Dana**." Plus the prompt and a 90s text box (3 words max). No one else ever sees your assignment.
3. **Shared host screen:** the prompt ("a smell you'd recognize in the dark"), a timer, and lock-in dots — nothing else.
4. Talking is forbidden while writing. You may stare at people.
5. Reveal: host shows all answers unattributed, then attributed, then draws the arrow cycle. Each arrow scores: exact match 3, host-adjudicated near-match 1. A **Convergence Bonus** (+5 each) fires if every answer lands in one cluster.

The tension is exact: the *Dana-specific* answer wins your edge but breaks the room; the Schelling answer wins the bonus but feels like a cop-out. You resolve it blind, in silence, in 90 seconds.

## Technical approach
Host tab + phone PWAs over one PartyKit Durable Object (or Socket.IO behind Tailscale Serve). Room state: `{players[], cycle: Map<id,id>, prompt, answers: Map<id,string>, phase}`. Low message volume; latency is irrelevant.

The genuinely hard part is not sync — it's the **secrecy boundary**. The cycle lives only in the DO; each socket receives exactly one field (`yourTarget`), and the full map is serialized to clients only on the `REVEAL` phase transition. One lazy broadcast of full room state leaks the whole game, so state fan-out goes through a per-socket projection function, not a spread of the room object. Second hard part: match adjudication. v1 does casefold + strip-punctuation exact match, and the host screen renders every arrow as a tappable pair the host can promote to partial credit.

## v1 scope
- 4 players, hardcoded, one room code
- One prompt from a list of 20
- One round, 90s timer, 3-word answers
- Single-cycle derangement only
- Exact-match scoring + host tap-to-award-1
- Arrow-graph reveal on host screen, one animation

## Out of scope
Multi-round, embeddings/fuzzy scoring, spectators, reconnect, multi-cycle derangements, persistent profiles, sound.

## Risks & unknowns
Strangers can't impersonate each other — needs a group that knows one another. The Schelling answer may dominate so hard the cycle stops mattering; if so, weight edge score above the bonus. Reveal order must build tension, not dump a table.

## Done means
Four phones, four different private targets, one prompt. Nobody sees another's assignment at any point. Host screen shows the arrow cycle, per-edge scores, and correctly fires or withholds the Convergence Bonus. A table of four laughs at the reveal without anyone having explained the rules twice.
