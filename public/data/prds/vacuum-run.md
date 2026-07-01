## Overview
Vacuum Run is a cozy "maintenance driving" sim. You drive an autovacuum rig through a Postgres database rendered as a road network — tables are stretches of highway, dead tuples are debris to clear. Optionally connect a real local Postgres so your own bloat spawns the routes. For DBAs who'll grin and truck-sim comfort-players who just want a calm loop.

## Problem
Database maintenance is invisible and thankless; nobody thanks the autovacuum. Truck sims, meanwhile, are beloved precisely for turning tedium into calm. Bridge them: make VACUUM a scenic haul with a satisfying "reclaimed 3.2MB" chime.

## How it works
Each table is a road segment sized by row count; dead tuples are debris/cargo you clear by driving over them; bloat shows as potholes; long-running transactions are traffic jams that block your lane until they commit. You cruise the schema's foreign-key "highway" table to table, watching each bloat meter drop to zero. No fail state — ambient audio, slow pings, a serviced-database summary at the end. In real mode the map IS your database's current `pg_stat_user_tables`, and an optional gated button issues a genuine `VACUUM VERBOSE`.

## Technical approach
Web front-end (2D top-down Canvas, or low-poly Three.js) plus a tiny local Node/Bun backend using `pg`. The backend runs read-only `SELECT * FROM pg_stat_user_tables` and `pg_relation_size`, and reads the FK graph from `information_schema.table_constraints` to lay roads. Debris density = `n_dead_tup / n_live_tup`. An "actually vacuum" button runs `VACUUM (VERBOSE) tablename` behind a confirm dialog and a read-mostly role. The hard part is making a driving game *feel good* in-browser with minimal assets, plus safely sandboxing the DB (read-only role, no arbitrary SQL, allowlist). A synthetic demo DB ships so no Postgres is required to play.

## v1 scope
- Synthetic 6-table database baked in
- Top-down 2D, arrow-key driving
- Clear debris → each table's bloat meter drops
- Ambient loop + serviced summary screen

## Out of scope
- Real DB connections, live `VACUUM` execution, 3D, multiplayer, MySQL/other engines

## Risks & unknowns
In-browser driving feel; scope creep toward becoming a real ops tool; safety of executing live SQL (must gate hard). Balancing "cozy" against "pointless."

## Done means
I load the page, drive the rig across all 6 synthetic tables, clearing debris drops each table's bloat meter to zero, and finishing every table shows a "database serviced" summary.
