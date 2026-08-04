## Overview

A 3-player text game for a couch and a TV. The host screen is a single chat thread with one NPC — call them Sam. All three players are secretly writing Sam's friend. Only one of you should reply to any given message. Nobody wants to be the one who doesn't.

## Problem

Word party games reward the fastest funny thought, which means the same two loud people win every time. Double Text inverts it: speed is a liability. The scarce thing is not wit, it's *airtime* — and the private information that makes you want a specific opening is exactly the thing you can't safely announce.

## How it works

**Setup.** Each phone privately deals 3 **constraint cards** — mechanical, checkable rules like *≤ 4 words*, *must contain a question mark*, *must name a food*, *no letter E*. Card values 1–3. Nobody sees anyone else's.

**The round is 6 incoming messages.** Sam texts something on the TV: "omg you will not believe what just happened at work." An 8-second **send window** opens.

On each phone, privately: your remaining cards, a text box, a card-select, and SEND. You type a reply, attach one card, and decide whether to fire.

- **Exactly one player sends** → it posts to the thread, the server checks the card mechanically, they score it, and — the real prize — **Sam's next message branches off that reply**, steering the conversation toward or away from other people's remaining cards.
- **Two or more send inside the window** → double-text. Both messages post, stacked, visibly desperate. The TV's **vibe meter** drops. Both attached cards are discarded **unscored**. Sam's next message is a cold one — `k` — which fits almost nobody's cards and burns an opening for the whole room.
- **Nobody sends** → Sam sends a follow-up and the vibe meter drops a little. Waiting is not free.

**Talking out loud is allowed and lying is expected.** "This one's no good for me, go ahead" is a completely legal sentence and frequently false. You can't verify anyone's cards until the end-of-round reveal.

The engine of the game is that good openings are scarce and *fit is private*. When Sam mentions lunch, two players with food-shaped cards both twitch toward SEND, and the 8-second window is far too short to negotiate honestly.

**Host screen:** the thread, the vibe meter, a live send-window countdown, and a typing indicator that shows *how many* players are composing but never which ones. **Phone:** cards, composer, send.

## Technical approach

PartyKit / Durable Object per room, or Socket.IO over Tailscale Serve. State: `{ thread[], vibe, players: { cards[], score }, window: { openedAt, submissions[] } }`.

Sends are buffered, not applied on arrival: the server collects everything that lands inside the window and resolves at close, so a 200ms network advantage can't win a collision. Client timestamps are ignored entirely — server receipt time is authoritative, which is fine because the window is 8s.

Constraint checking is deliberately dumb and deterministic: regex and word-count over the submitted string. No LLM, no judging, no voting. The NPC is a hand-written 3-branch tree keyed on the last reply's card type plus a cold-branch for double-texts.

The genuinely hard part is the composing indicator — it must leak enough tension to make people panic-send without ever identifying who's typing, so it's an anonymized count with a 1.5s decay so late-cancelling still reads as pressure.

## v1 scope

- 3 players, one round of 6 incoming messages
- 12 hand-written constraint cards, 8 hand-written Sam messages, one 3-branch tree
- Vibe meter is cosmetic; score is card values only
- End-of-round reveal of everyone's unplayed cards

## Out of scope

LLM-generated NPC, multiple NPCs, group threads, images/emoji reactions, more than 3 players, any persistent profile.

## Risks & unknowns

Typing on phones is slow — 8s may be too tight for a card like *no letter E*; needs playtest tuning per card. The bluffing layer may collapse if players just agree to a turn order in round one; the fix is making card-fit lopsided enough that turn-taking visibly costs someone their 3-point card. Reading a thread on a TV from a couch requires large type and hard limits on message length.

## Done means

Three phones join by QR, one 6-message round plays start to finish, a deliberate simultaneous send produces a visible stacked double-text plus `k` from Sam with both cards shown discarded, and the final scoreboard reflects only mechanically-verified card satisfactions.
