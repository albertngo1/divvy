## Overview

A 4-player, 6-minute shouting game for people who love Anomia's panic but are tired of the card-flip bookkeeping. Everyone is assigned a secret category — *breakfast foods*, *things with a spine*, *French words English stole* — and every phone in the room displays that category **except the phone belonging to the person it was assigned to**. You spend the round blurting nouns at a category you cannot see, learning what you are only from which blurts the room accepts.

## Problem

Anomia's fun is the blurt-race, but the information is symmetric and public: both duelists read both cards, so the only variable is reaction speed. Fast people win, and everyone else spectates their own turn. There's also no memory — a won card teaches you nothing. This version keeps the panic and adds an inference spine, so slow-but-clever players have a lane, and every duel leaves evidence behind.

## How it works

Each player gets a hidden category and a visible **symbol** (one of five shapes). The TV shows only four big symbol tiles, one per player, plus the score.

**Private phone view:** the other three players' categories, spelled out plainly, and two big ACCEPT buttons. You never see your own.

The host reshuffles symbols every ~4 seconds. When two players' symbols collide, the TV flashes **DUEL: Ana vs Dev** and both duelists must blurt out loud a valid example *of their own hidden category*. The two non-duelists are the referees: the first of them to tap ACCEPT on a name awards that duelist the point. Wrong blurts cost nothing but time, and time is the whole resource.

The payload: every accepted blurt is posted to the TV as a permanent public list under your name. "Waffle ✓ · Toast ✓ · Kayak ✗" is a shape, and it's a shape *you* can read too. After six duels the round ends and every phone shows one private text box: **name your own category**. Correct guess doubles your round score. So you're incentivized to blurt wide early — probe with nouns from different neighborhoods — and narrow once the shape shows.

The delicious part is the referees. They know the answer, they can see the duelist swinging one word away from it, and their only legal move is to sit there and hold a button.

## Technical approach

PartyKit Durable Object per room; phones are a PWA joining by 4-letter code. State: `{players: [{id, name, categoryId, symbol, accepted[], rejected[]}], duel: {a, b, openedAt}, phase}`.

Every client receives a **redacted projection** — the server never ships a player their own `categoryId`, so a devtools-open cheater sees nothing. Categories come from a hand-written pack of 40; validity is judged by humans, not a word list.

The hard part is the ACCEPT race. Two referees tapping within 200ms of each other on different duelists must resolve identically for everyone, and the awarded point must land before the symbol reshuffle fires. The DO serializes on arrival order and holds a 150ms settle window: first tap opens the window, any conflicting tap inside it loses, the TV animates the result only after the window closes. Symbol reshuffle is server-timed and paused during a duel.

## v1 scope

- Exactly 4 players, one 6-duel round, no lobby persistence
- 40 hand-written categories, 5 symbols, no card deck
- Referee ACCEPT only — no reject button, no challenges
- One final self-guess, exact string match against a small alias list
- TV: symbol row, duel banner, accepted-blurt columns, score

## Out of scope

Teams, multiple rounds, speech recognition, category packs, rejoin-after-disconnect, spectators, any animation beyond a flash.

## Risks & unknowns

Referees may accept out of pity — needs playtesting to see if that kills the inference. Categories must be broad enough to blurt into blind but narrow enough to identify at the end; that band may be thin. Four players is the minimum for two referees, which makes drop-outs fatal.

## Done means

Four phones join a code, no player can retrieve their own category from any payload, a symbol collision triggers a duel that both referees see instantly, first ACCEPT awards a point and posts the blurt to the TV within 300ms, and after six duels all four phones show the self-guess box and the TV reveals every category at once.
