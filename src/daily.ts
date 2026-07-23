import type { Idea } from "./types";
import { heuristicScore } from "./score";

// "Today" — a small, finite, deliberately-mixed handful surfaced on load so the ~1400-idea
// cloud has a humane entry point instead of a wall of dots. The whole point is to ease
// overwhelm: you engage with 5 things, not everything. The set is DETERMINISTIC per calendar
// day (stable across reloads, rotates at midnight) and prefers ideas you haven't opened yet.

export type DailyKind = "fresh" | "hot" | "wild";
export interface DailyPick { idea: Idea; kind: DailyKind; }

// tiny seeded PRNG so a given day always yields the same handful (no Math.random)
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// today's date key in the viewer's local timezone (YYYY-MM-DD) — the rotation clock
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// seeded Fisher–Yates
function shuffled<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick the day's handful. Composition (target 5): 2 FRESH (newest scan), 2 HOT (top by
 * heuristic score, rotated so it isn't always the same leaderboard), 1 WILD (a random pick
 * for serendipity). Unseen ideas are preferred throughout; picks are backfilled if a pool
 * runs dry, and the result is de-duped and capped.
 */
export function pickDaily(
  ideas: Idea[],
  votes: Record<string, number>,
  seen: Set<string>,
  lastScan: string,
  key = todayKey(),
  count = 5,
): DailyPick[] {
  if (!ideas.length) return [];
  const rnd = mulberry32(hashStr(key));
  const unseen = (d: Idea) => !seen.has(d.slug);
  const picks: DailyPick[] = [];
  const used = new Set<string>();
  const take = (d: Idea | undefined, kind: DailyKind) => {
    if (!d || used.has(d.slug)) return;
    used.add(d.slug); picks.push({ idea: d, kind });
  };

  // FRESH: from the newest scan date (fall back to the two most-recent dates if that's thin),
  // unseen first, seeded-shuffled so it rotates within the batch.
  const dates = [...new Set(ideas.map((d) => d.created))].sort().reverse();
  const freshDates = new Set([lastScan, ...dates].filter(Boolean).slice(0, 2));
  const freshAll = ideas.filter((d) => freshDates.has(d.created));
  const freshPool = shuffled(freshAll.filter(unseen), rnd).concat(shuffled(freshAll.filter((d) => !unseen(d)), rnd));
  freshPool.slice(0, 2).forEach((d) => take(d, "fresh"));

  // HOT: top slice by heuristic score, then seeded-pick from it so strong-but-varied ideas
  // surface instead of the same frozen top-2 every day.
  const ranked = ideas
    .filter((d) => !used.has(d.slug))
    .map((d) => ({ d, h: heuristicScore(d.score, votes[d.slug] || 0) }))
    .sort((a, b) => b.h - a.h);
  const hotTop = ranked.slice(0, Math.min(40, ranked.length)).map((r) => r.d);
  const hotPool = shuffled(hotTop.filter(unseen), rnd).concat(shuffled(hotTop.filter((d) => !unseen(d)), rnd));
  hotPool.slice(0, 2).forEach((d) => take(d, "hot"));

  // WILD: a serendipitous unseen pick from everything left.
  const rest = ideas.filter((d) => !used.has(d.slug));
  const wildPool = shuffled(rest.filter(unseen), rnd).concat(shuffled(rest.filter((d) => !unseen(d)), rnd));
  if (wildPool.length) take(wildPool[0], "wild");

  // backfill to `count` from the ranked remainder if any pool came up short
  if (picks.length < count) {
    for (const { d } of ranked) {
      if (picks.length >= count) break;
      take(d, "hot");
    }
  }
  return picks.slice(0, count);
}
