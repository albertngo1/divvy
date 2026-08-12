## Overview
A six-minute negotiation game for 4–6 phones. The TV puts a single binary proposal in front of the room. Everyone has a secret stake in the outcome. Everyone can talk as much as they want — but a ballot only becomes castable after your own phone has heard you stay quiet for *your* secret arming time, which ranges from 4 seconds to 35 and which nobody else knows. Persuasion disenfranchises you. Silence is power you can't demonstrate.

## Problem
Group-decision party games make talking free, so the loudest table-hog wins by attrition. Games that punish talking usually just tax it, which turns the room into accountants. The unexplored move is to make speech and *authority* mutually exclusive, then hide the exchange rate — so the room genuinely cannot tell whether the person monologuing is a fool burning their vote or a cheap-arming shark who can afford it.

## How it works
Host screen: the proposal ("The group spends the whole prize pot on one person's choice — YES or NO"), a 3-minute debate clock, and a live count of how many ballots are currently armed **in aggregate only** — "3 of 5 armed" — which tells the room a fact without telling it a name. That aggregate ticking down as someone starts talking is the best tell in the game.

Each phone privately shows: (1) your stake card — which outcome pays you and how much, sometimes a spoiler card that pays only if the vote is unanimous the wrong way; (2) your secret arming requirement, e.g. **12s of your own silence**; (3) a charge ring that fills while your mic reads silence and dumps 60% of its charge the moment you speak; (4) once full, a live VOTE button — which stays live only while you keep your mouth shut.

At 3:00 the debate clock ends and a 10-second ballot window opens with the mic still armed: speaking during the window disarms you mid-vote. Only armed ballots count. The TV reveals the tally, then the stakes, then everyone's arming times — which is when the room discovers that the guy who never shut up needed 4 seconds.

## Technical approach
Host tab + phone PWAs + one authoritative room actor (PartyKit / Cloudflare DO, or Socket.IO behind Tailscale Serve for LAN play).

Data model: `Room { code, phase, proposalId, endsAt, armedCount }`, `Player { id, stakeCard, armMs, chargeMs, speaking, ballot }`. The server owns `chargeMs` and recomputes it from speaking-edge events so a hacked client can't self-arm; phones render an optimistic ring and reconcile on each 1Hz server tick.

On-device VAD: `getUserMedia` → `AudioWorklet`, adaptive noise floor from a 3s calibration, 250ms hangover. Phones emit `{speaking:true|false, t}` edges only.

The hard part is **fairness under cross-talk**: one loud speaker trips four mics, which would disarm bystanders and make the game feel arbitrary. Fix: normalize each device's RMS as a z-score over its own floor and let the server award each 100ms frame to the single highest-normalized phone; non-winners are treated as silent for that frame. Secondary hard part is the aggregate armed-count — it must update fast enough to be a tell but be smoothed (500ms) so it can't be used to fingerprint one individual's arming time.

## v1 scope
- One room, 4 players, one proposal, one 3-minute debate, one ballot window.
- Arming times dealt from a fixed set {4s, 10s, 20s, 35s}, one each.
- Two stake cards per outcome; no spoiler cards yet.
- TV shows proposal, clock, aggregate armed count, final tally.
- Reveal screen showing everyone's arming time and stake.

## Out of scope
- Multiple proposals, campaign phases, persistent scoring, spectators.
- Any speech recognition — we detect voice activity, never words.
- Abstentions, proxies, vote trading UI (trade verbally, at your own cost).

## Risks & unknowns
- The 35s player may simply never arm and check out; may need a floor guarantee ("charge decays 60%, not 100%") — already in, but tune it.
- Cross-talk arbitration could still punish a bystander who laughs; a laugh should probably cost you, which is funny, but test it.
- Rooms may converge on total silence, which is a boring degenerate equilibrium. Counter: a stake card that only pays on a split vote, forcing someone to campaign.

## Done means
Four people play one round; at least one player argues hard, fails to arm, and visibly realizes it during the ballot window; the aggregate armed counter visibly moves when someone starts talking; and the reveal produces at least one accusation of "you KNEW you only needed four seconds."
