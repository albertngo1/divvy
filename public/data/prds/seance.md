## Overview

The group takes turns asking yes/no questions of "the server" — an LLM ghost. The server has a secret rule it's applying to every question (e.g. "answer yes if the question contains an odd number of vowels" or "answer yes if the last word rhymes with a color"). The players must reverse-engineer the rule by pattern-matching across answers. First player to correctly declare the rule wins the round. Per-phone: each player asks questions privately from their own device so nobody can hoard the guessing pen, and the shared answer log is the group's collaborative evidence board.

## Problem

Games like *Zendo* and *Mao* are pure rule-inference games — hilarious and cerebral, but historically hard to run because a human "god" has to remember and apply the rule perfectly, and can't be a player. An LLM is a natural god: give it a hidden rule in a system prompt and it will apply the rule to any question thrown at it, without cheating or getting tired. No existing party game leans into LLM-as-rule-oracle this way.

## How it works

Room code join, 3-8 players. Server picks a hidden rule from a curated list (or Haiku generates one from a schema). Each player's phone shows two things: a shared "answer log" of all questions asked so far (with the server's yes/no answers), and their private "ask a question" input. Players take turns (or free-for-all with rate limits) asking questions. The server runs each question through Haiku with the hidden rule in the system prompt and returns yes/no. At any time, a player can hit "declare rule" and type their guess. Server (via Haiku) judges whether their guess is functionally equivalent to the true rule. Correct = win the round; wrong = they sit out the rest of this round.

## Technical approach

Haiku via Anthropic API. System prompt for the "oracle" phase: `You are answering yes/no questions. The secret rule is: <RULE>. Apply the rule strictly. Respond with exactly YES or NO.` System prompt for the "judge" phase: `The true rule is <RULE>. A player guessed <GUESS>. Are these functionally equivalent? Respond YES or NO with one sentence of reasoning.` Room state = `{round, rule, questions: [{player, q, a}], winners, eliminated}`. Personalized view: everyone sees the log; only that player sees their own "declare rule" input. Prompt caching on the system prompt to cut cost across many questions per round.

## v1 scope

3-6 players, 3 rounds, curated list of 20 hand-authored rules (mix of easy: "yes if the question contains the letter 'e'"; medium: "yes if the noun is edible"; hard: "yes if the answer to the literal question would be yes AND it contains an even number of words"), free-for-all asking (no turns), one guess per player per round, Haiku judges rule-equivalence.

## Out of scope

LLM-generated rules (curated only in v1), rule difficulty voting, multi-rule stacking, team play, streak scoring, rule categories, spoken-question mode, replay of the log, custom rule editor.

## Risks & unknowns

Haiku consistency is the whole gamble — if the model applies the rule inconsistently across 30 questions, the game breaks. Prompt engineering + a few test rounds will tell us fast; prompt caching helps consistency by keeping the system prompt stable. Rule-equivalence judging is fuzzy — "yes if it contains a vowel" vs "yes if it has any of aeiou" should count as same; judge model needs a decent prompt. Cost: ~30 questions * 3 rounds * cheap prompt = tolerable. Rule curation is real work; balance easy/medium/hard carefully so the first game isn't demoralizing.

## Done means

Four friends stare at their phones asking increasingly absurd questions ("does a lobster have feelings?") and gasp when the pattern clicks. At least one round ends with someone shouting "I GOT IT" and being wrong. If the group tries to guess the rule together over the debrief, v1 shipped.
