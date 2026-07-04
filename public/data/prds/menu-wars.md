## Overview

Group scrolls the same DoorDash/Yelp menu together on their phones; each player privately builds a hypothetical 3-item order within a hidden budget. On reveal, everyone's orders display side-by-side; group votes on best order + worst order + "sincerest" order. Turns the (universal, mundane) act of scrolling a takeout menu into a party game. Load-bearing per-phone because each order must stay private until reveal, and each phone provides its own scroll pace.

## Problem

Group-ordering takeout is a real friction point ("what does everyone want?"). Meanwhile, scrolling a menu with friends is inherently comedic — everyone has strong opinions and specific weird preferences. Nobody has captured that texture as a game. This is the party-food equivalent of Fibbage/Blank Slate: extracting fun from a shared everyday experience.

## How it works

Room code join, 3-8 players. Host pastes/enters a menu URL (Yelp, DoorDash, or a simple text-copy option). Server scrapes/parses the menu into a browsable list on every phone. Each player privately builds a 3-item order within a hidden $ budget (e.g. $25). 3 min to build. On reveal: all orders display side-by-side with prices. Group votes via each phone on categories: "Best Order", "Worst Order", "Most Chaotic Order", "Order Most Likely To Be From X's Ex". Cross-category winners crowned. Optional coda: group agrees on ONE order to actually place via a copy-to-clipboard button.

## Technical approach

PartyKit / Durable Objects. Room state = `{menu: [{name, price, section}], orders: {player_id: [item_ids]}, votes: {category: {player_id: voter}}}`. Menu ingest: parse Yelp/DoorDash HTML (fragile, may need per-source parsers) OR paste-and-select (user pastes menu text, LLM parses it into structured items, cached per URL). Voting UI: tap each order card to vote in a category. Multiple categories can be won by same order.

## v1 scope

4 players, 1 menu (paste-and-parse mode; skip real DoorDash scraping in v1 — just LLM parse the text a user pastes), 3-item orders, $25 budget, 3-min build phase, 3 vote categories (Best/Worst/Chaotic), 1-min vote phase. No live order placement, no history, no per-item preview beyond name+price.

## Out of scope

Yelp/DoorDash live scraping, actual order placement integrations, split-the-bill math, dietary filters, group budget negotiations, per-order narration ("here's why I picked X"), image previews of items, calorie/allergen data, save-favorite-orders history.

## Risks & unknowns

Menu parsing (paste-and-LLM-parse) is fragile — long menus may exceed context or come back mangled; needs error handling. Voting for "Worst Order" may hurt feelings; playtest whether the group takes it in stride or someone gets prickly. Menu availability: what if the group is looking at a Yelp menu but doesn't want to actually order from that restaurant? — the game is fun anyway, but the "actually order it" coda may not fire. The game may feel too niche (real-when-you-happen-to-be-eating) vs. universally playable.

## Done means

4 friends open the room, one pastes a menu, everyone builds an order, and at reveal time the group vote produces at least one "of COURSE that's yours" laugh. If two people vote to actually place the winning order, v1 shipped.
