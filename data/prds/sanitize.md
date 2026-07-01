## Overview
A browser action game that turns SQL-injection defense into Sekiro-style posture combat, for developers who want the parameterize/escape/whitelist reflex drilled into muscle memory. The DBeaver-and-Postgres feeds meet From Software's deflection loop.

## Problem
SQL injection is taught as dry OWASP prose; the instinct to reach for the *right* defense under pressure never gets trained. Reading about `' OR 1=1--` doesn't build a reflex. Also, frankly: a swordfight where the blades are malicious queries is just cool.

## How it works
Payloads (`' OR 1=1--`, `'; DROP TABLE users;--`, UNION-based reads, blind time-based) fly at your "query gate" on a rhythm. Each maps to a correct counter: **Parameterize**, **Escape**, **Whitelist**, or **Reject**. Parry inside the timing window = posture damage to the attacker; a wrong or late parry = your database takes a hit. Chain perfect parries to break posture and trigger an "execute" finisher. Attackers escalate from script kiddie to ORM-bypasser, with feints that mimic benign input.

## Technical approach
Canvas + a fixed-timestep rhythm loop (rAF). The attack deck is JSON: `{payload, category, correctDefense, feint?}`, each with a per-attack timing-window state machine. The real teeth: an optional sandbox that runs your chosen defense against **SQLite WASM (sql.js)** seeded with a `users` table — a wrong parry visibly leaks or deletes rows on screen, making the abstraction concrete. The genuinely hard part is keeping defense choices legible at combat speed without dumbing the security lesson into theater.

## v1 scope
- One attacker, 10 payloads
- 4 defense buttons, timing-window parry, posture bar
- sql.js reveal on a miss: watch the table actually get read/dropped

## Out of scope
- XSS, NoSQL, SSRF and other vuln classes
- Multiplayer duels, level editor, real backend, bosses/combos

## Risks & unknowns
Oversimplifying the mapping risks teaching security theater. Timing pressure and learning can fight each other. Getting parries to feel Sekiro-crisp is genuinely hard.

## Done means
A player clears all 10 payloads and, in a plain quiz afterward, correctly maps ≥8/10 payloads to their proper defense — with the sql.js sandbox confirming that each parried payload no longer alters the seeded table.
