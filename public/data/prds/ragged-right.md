## Overview
Ragged Right is a solo budgeting tool that treats bill scheduling as a **line-breaking problem**. Your pay periods are lines with a fixed measure (income). Your bills are words with widths (amounts). The optimal payment schedule is the one a typesetter would choose: globally optimal, not greedy, minimizing total *badness* across the whole paragraph rather than cramming each line until it overflows. For anyone with lumpy income (freelancers, biweekly-paid folks with monthly bills) who keeps discovering that three annual renewals all land in the same week.

## Problem
Every budgeting app is greedy: it fills the current period until money runs out, then panics. But bills have *slack* — a due date plus a grace window, an autopay you can shift by a week, a card statement you can pay early. Humans solve this by moving one bill at a time and re-checking, which is exactly the first-fit algorithm TeX abandoned in 1977 because it produces one horrible line to save an earlier one.

## How it works
You declare bills (`amount`, `earliest`, `due`, `hard_deadline`, `movable: true|false`) and an income calendar. Each pay period is a *line* whose measure = income − non-discretionary floor. Discretionary spending is **glue**: it has a natural width, a stretch limit, and a finite shrink limit (you can eat rice, but not for free). Fixed autopays are unbreakable boxes.

Badness of a line is `100·|r|³` where `r` is the stretch/shrink ratio of its glue, exactly as in TeX. Penalties: moving a bill past its grace window costs the real late fee; crossing the 30-day credit-report cliff costs a large fixed penalty; a line that cannot shrink enough is **overfull** — an overdraft — and reported verbatim as `Overfull \hbox (badness 10000) in paragraph at lines 14--15`. A Knuth-Plass total-fit DP (shortest path over feasible breakpoints, with the same active-node pruning) finds the globally minimal-badness schedule for the next 12 periods.

Output is two things: a plain schedule ("pay the insurance on the 9th, not the 22nd") and an SVG of your year *actually justified as text*, each bill set at font-size ∝ dollars. Loose lines (grey, airy) are slack months. Tight lines are danger. Vertical white channels running down several lines are **rivers** — the recurring weeks you're always broke.

## Technical approach
Python, no service. Input: a YAML bill file plus an OFX/CSV export for the income series. Core is ~200 lines of DP: nodes are (bill index, period, fitness class), edges scored by badness + penalty, with the adjacent-fitness-class penalty borrowed straight from TeX so the schedule doesn't lurch from a starving month to a lavish one. Rendering via `svgwrite` with real glue distribution.

The genuinely hard part is **calibrating shrink**: TeX glue shrink is a declared constant; your real discretionary floor is unknown. v1 estimates it as the 10th percentile of the last 6 months of non-fixed spend, and exposes it as a dial — the whole model is only as honest as that number.

## v1 scope
- Hand-written `bills.yaml`, hardcoded biweekly income
- Total-fit DP over 12 periods, late-fee + overdraft penalties only
- Terminal output with TeX-style `Underfull`/`Overfull` warnings
- One static SVG of the justified year

## Out of scope
Plaid/bank sync, actually moving due dates via APIs, debt-payoff optimization (avalanche/snowball), mobile, multi-account.

## Risks & unknowns
Cubic badness may be the wrong pain curve for money — real financial stress is closer to a hard cliff at zero than a smooth penalty. Users may not have real flexibility on due dates, making the whole optimization decorative. The typographic output could delight or read as a gimmick hiding a spreadsheet.

## Done means
Given a bills file where a naive month-by-month greedy schedule produces one overdraft, Ragged Right returns a schedule with zero overfull lines, and the SVG visibly shows a river through the two weeks you always dread.
