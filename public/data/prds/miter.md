## Overview
Miter is a 4-player (two pairs) cooperative-competitive party game about joinery. Within each pair, one phone writes the front half of a sentence and the other writes the back half — blind to each other — and a small in-browser LLM scores how smoothly the two halves meet at the joint. Like a miter joint in woodworking, the whole game is whether two independently-cut edges mesh. For friends who like telepathy games and the comedy of near-misses.

## Problem
Every collaborative-writing game lets partners see the shared text. That turns it into editing. Miter's itch is coordination under total ignorance of your partner's move: you must anticipate what half your teammate is probably writing so the seam clicks — and the model, not a human judge, delivers the verdict at exactly one token, the junction.

## How it works
Host shows a shared TOPIC word (e.g., 'harbor'). Each pair has a Left and a Right phone. PRIVATELY, Left writes the opening half (4-7 words, ending mid-thought); Right writes the closing half (4-7 words) that will be appended. Neither sees the other's text — each phone shows only its role, the topic, and its own editor. A 75-second timer runs.

At reveal, the host concatenates Left+Right and computes, under distilgpt2, the SEAM surprisal: -log2 P(first Right-token | Left-half). Lower = smoother join. The SHARED host screen assembles each pair's sentence, highlights the exact junction token, and animates its surprisal as a satisfying 'click' (low) or grinding 'clunk' (high). Smoothest seam wins the round. Because the two halves are written simultaneously and blind, one passed-around phone literally cannot reproduce the game — the per-phone private ignorance IS the mechanic.

## Technical approach
Host tab + phone PWA clients + authoritative WebSocket server (PartyKit / Durable Object or Socket.IO over Tailscale Serve). Data model: Room{code, phase, pairs[]}; Pair{leftId, rightId, topic, leftText, rightText}; each Player{id, name, role}. Sync: server assigns roles and pairs at start, barrier-locks each phone's submission, waits until all four in or timer expires, then the host runs two forward passes to score the two seams (sub-second). The genuinely hard part is defining the seam token cleanly: the halves are joined with a single space, the Right-half's first token's conditional surprisal given the full Left context is the scored quantity, and tokenization must be computed host-side over the concatenation (not per-half) so boundary effects are captured. Phones need no local model in v1.

## v1 scope
- Exactly 4 players → two fixed pairs, ONE round
- Server-assigned Left/Right roles, one shared topic
- 75s timer, blind halves, host-authoritative seam scoring
- Reveal with junction-token highlight and click/clunk animation

## Out of scope
- Odd player counts / dynamic pairing
- Whole-sentence perplexity as tiebreak (v1 uses seam only)
- Multiple rounds, role-swap, partner rotation

## Risks & unknowns
- With only two pairs the sample is tiny; ties on seam surprisal need a defined tiebreak (fall back to overall perplexity)
- Some topics may make almost any join smooth; topic list needs tuning for tension
- Players might exploit ultra-generic Right-halves ('and stuff.') — a minimum-content-word rule may be required

## Done means
Four phones split into two pairs, each writes a blind half, and the host displays both assembled sentences with a correct seam-surprisal ranking and the junction token visibly highlighted — with the winning pair being the one whose independently-written halves actually meshed.
