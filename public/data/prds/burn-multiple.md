## Overview
Burn Multiple is a satirical idle/tycoon browser game about running an AI-agent startup in the current hype cycle. You hire agents, raise rounds, and try to reach 'AGI' — while every efficiency gain is quietly eaten by rising token costs and agents that underdeliver. It's for developers who read the Zuckerberg 'agents are slower than expected' and 'AI costs more than the engineer' headlines and laughed darkly.

## Problem
The itch is cultural, not practical: the gap between AI marketing and AI reality is comedy gold, and no idle game captures the specific absurdity of burning capital on compute for diminishing, plausibly-wrong output. Existing startup tycoons are generic; this one is pointed.

## How it works
Core loop: agents auto-generate 'tickets closed' per second, converting to revenue. But each agent consumes tokens; token price drifts upward with usage (a soft difficulty ramp), so your 'burn multiple' (net burn ÷ net new ARR) is the real health bar. You buy upgrades — bigger context, better models, 'code cleanliness' to make agents more accurate — but every upgrade has a mischievous catch (a smarter model costs 4x tokens; cleaner code helps only if you also pay down 'tech debt' that agents secretly generate). Random events fire: 'model deprecated mid-sprint,' 'agent hallucinated a dependency,' 'board demands AGI demo.' Prestige = 'pivot,' resetting with a permanent hype multiplier.

## Technical approach
Stack: pure client-side TypeScript + a tiny reactive state store (Zustand or hand-rolled), rendered with plain DOM/CSS for that spreadsheet-y VC-deck look; no backend, save to `localStorage`. The economy is a set of coupled difference equations: `tickets/sec`, `token_price(t)` as a monotonic curve with noise, `accuracy` gating what fraction of tickets actually count as revenue vs. become debt. A fixed-timestep tick loop (with offline-progress catch-up via timestamp delta) drives it. The genuinely hard part is balancing the burn-multiple curve so the game stays tense — always almost-profitable, never comfortably so — and writing enough sharp event copy to carry the satire.

## v1 scope
- One agent type, one resource (tokens), one currency (ARR)
- Rising token-price curve creating the core tension
- 5 upgrades and 6 random events with punchy copy
- Offline progress + localStorage save

## Out of scope
- Prestige/pivot system, multiple model tiers, achievements
- Art beyond CSS; sound
- Leaderboards or accounts

## Risks & unknowns
- Idle-game balance is finicky; may feel grindy or trivially winnable
- Satire ages fast as the news cycle moves
- Hard to make numbers-go-up compelling without deeper systems

## Done means
A fresh player can play for ten minutes, watch their burn multiple swing from doom to hope and back, trigger at least two random events, close the tab, reopen it, and see correctly-computed offline progress.
