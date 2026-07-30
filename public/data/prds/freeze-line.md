## Overview
A CLI + single-file HTML report that reconstructs the write history of a Postgres table from MVCC metadata nobody queries: `xmin`, `xmax`, `ctid`, and infomask bits. For anyone who has said "when did these 40,000 rows change and who did it" about a table with no `updated_at` and no audit trigger.

## Problem
MVCC's bookkeeping is usually discussed as a *cost* — bloat, vacuum, wraparound. But it's also the only write provenance you get for free, and it's thrown away by every ORM. When you inherit a production database, the questions are: was this column backfilled by a migration or written by the app? Which rows are hot? Did that incident touch data? Adding an audit trigger answers those going *forward*. The answers for the past are already sitting in the heap.

## How it works
Step 1, cheap scan: `SELECT ctid, xmin::text::bigint AS x, xmax::text::bigint FROM tbl` (plus `age(xmin)`). Sorting by xmin gives exact write *ordering* for every live row.

Step 2, dating. `pg_xact_commit_timestamp(xmin)` only works if `track_commit_timestamp` was on — usually it wasn't. So instead: find any table in the database with both an xid-bearing heap and a trustworthy `created_at`, harvest (xmin, created_at) pairs, and fit an **isotonic regression** (PAVA — xids are monotone in time) mapping xid → wall clock. Apply that curve to *any* table, including ones with no timestamps at all. Report residual spread from the fit as the honest error bar per dated row.

Step 3, structure. Cluster xids with a gap-based split (a jump of >N xids ends a batch): a single xid covering 2M rows is a migration; 3,000 adjacent xids spread evenly over a day is app traffic. Then `pageinspect`: `SELECT * FROM heap_page_items(get_raw_page('tbl', n))` exposes dead line pointers, `HEAP_HOT_UPDATED` chains (rows rewritten hundreds of times), and `HEAP_XMIN_FROZEN`.

Report: a per-page heat strip colored by inferred last-write date, a batch timeline, a hot-row leaderboard, and a censored region — because frozen tuples have had xmin rewritten to `FrozenTransactionId` (2) and their history is *gone*. Naming that boundary honestly is the whole point, hence "freeze line".

## Technical approach
Python 3.12 + psycopg3 (server-side cursor, `itersize=50_000`), DuckDB for local aggregation over the sampled xid columns, scikit-learn's `IsotonicRegression` (or 30 lines of PAVA), report rendered as one self-contained HTML with Observable Plot. Requires `pg_read_all_data` for the scan; `pageinspect` needs superuser, so it degrades gracefully to xmin-only mode. Reads a physical replica by preference.

Hard part: 32-bit xid wraparound. `xmin::text::bigint` gives the truncated value, so pre-wraparound rows fold back onto recent ones. Detect via `datfrozenxid` from `pg_database` and refuse to date anything below the freeze horizon rather than lying.

## v1 scope
- One table, xmin-only scan
- Isotonic xid→time fit from one donor table you name explicitly
- Batch clustering + migration detection
- Text report; frozen/censored row count printed loudly

## Out of scope
pageinspect mode, xmax/deletion analysis, HOT chains, HTML report, multi-database, anything that writes.

## Risks & unknowns
Donor `created_at` columns are often app-set, not commit-time, skewing the curve. Heavy `VACUUM FREEZE` on an old table may leave nothing to find. Full-table scans on a primary are rude — replica-only guardrail may be needed.

## Done means
On a table with a known backfill migration in its history, the tool identifies that migration's xid batch and dates it within one hour of the real deploy timestamp, using only a donor table for calibration.
