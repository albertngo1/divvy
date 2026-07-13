## Overview
Tell steals the *deckbuilder-roguelike* loop (Slay the Spire's energy / block / vulnerable / boss-intent system) and makes it co-op with hidden hands. 3 players fight one telegraphing boss on a shared TV; each holds a private hand and must sequence cards *across players* per turn — but nobody can see anyone else's cards, so the whole game is spoken negotiation and calculated bluffing.

## Problem
Deckbuilders are solitaire — brilliant but silent and single-player. Co-op card games that show all hands (or pass one device) collapse into one loud person solving it for everyone. The tension of "I *think* I have the combo piece but I won't say exactly what" only exists if hands are genuinely, simultaneously private.

## How it works
Each turn the boss publicly telegraphs its **intent** on the TV ("Attacks for 12", "Doubles its next hit"). The party shares one HP pool. Then, per turn:
- **Each phone privately shows** that player's 6-card hand — cards like *Vulnerable* (boss takes +50% next), *Block 5*, *Strike 6*, *Double Next Card*. Card effects **stack in play order across players**, and everyone has limited energy.
- Players talk it out: "I can throw a Vulnerable — who has burst to follow it?" But you announce *intentions*, not exact cards; you might overpromise (a bluff to keep morale) or hold a secret *Block* for the hit you privately fear. The optimal line depends on an ordering nobody can fully see.
- Players commit their plays to a **shared timeline** on the TV; the server resolves it left-to-right. **The shared TV** shows the boss, HP, the played sequence resolving, and damage/block totals — never anyone's hand.

Passing one phone around would expose all three hands and delete the negotiation-and-bluff layer entirely — hidden simultaneous hands are the point.

## Technical approach
Host tab + 3 phone PWAs + authoritative WS server (PartyKit / Durable Object over Tailscale Serve). Data model: `fight {bossHp, partyHp, turn, intent, timeline[]}`; per-player `{hand[], energy, staged[]}`. Server owns all card data; phones only ever receive their own hand. Turn resolution: players stage cards into ordered timeline slots; on "resolve," server applies effects sequentially, computes damage/block, updates public state, then draws new private hands. Hard part: the *shared ordered timeline* — players must claim slots in real time without seeing each other's cards, so the server needs conflict-free slot assignment and a clean staged→locked state machine to prevent double-commits.

## v1 scope
- Exactly 3 players, one boss, one fixed 4-turn fight.
- 8 card types, fixed 6-card hands, 3 energy each.
- One intent type per turn (attack / vulnerable-window / heal).
- TV shows HP + resolving timeline only.

## Out of scope
- Deckbuilding between fights, relics, multiple bosses, more/fewer players, card upgrades, any persistence.

## Risks & unknowns
- Does hidden-hand sequencing produce real "aha, order it *this* way" moments, or just additive damage where order barely matters? Card set must make ordering load-bearing.
- Real-time slot claiming may confuse; might need explicit turn phases.

## Done means
Three phones join, each sees only its own hand, the party negotiates and stages cards into a shared timeline, the server resolves the order correctly against a boss intent, and the group wins or loses one 4-turn fight — with no player ever able to see another's cards.
