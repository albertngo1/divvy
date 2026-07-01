// Tag consolidation. The scanner invents many one-off tags (274 unique, ~200 used
// exactly once) plus source/medium tags that say nothing about the idea. We canonicalize
// at read time (non-destructive — ideas.json is untouched) so the filter, chips, and
// search all share one tidy vocabulary. Tune SYNONYMS / DROP here as the cloud grows.

// tags describing where an idea came from or its medium — noise for a domain filter
const DROP = new Set([
  "weekend-ideas", "steam", "github", "hacker-news", "hn", "reddit", "web", "interactive",
]);

// variants / plurals / near-duplicates → one canonical tag
const SYNONYMS: Record<string, string> = {
  dataviz: "data-viz",
  games: "game",
  gamedev: "game",
  "generative-art": "generative",
  "party-game": "party",
  "fantasy-league": "fantasy",
  "daily-game": "daily",
  deduction: "social-deduction",
};

export function canonTag(tag: string): string | null {
  const k = (tag || "").trim().toLowerCase();
  if (!k || DROP.has(k)) return null;
  return SYNONYMS[k] || k;
}

export function canonTags(tags: string[] = []): string[] {
  const out: string[] = [];
  for (const t of tags) {
    const c = canonTag(t);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}

// only tags shared by at least MIN_COUNT ideas are worth filtering by; a filter that
// selects a single idea isn't useful. Cap the list so the dropdown stays scannable.
const MIN_COUNT = 2;
const MAX_TAGS = 40;

export function consolidatedTags(ideasTags: string[][]): { t: string; n: number }[] {
  const counts: Record<string, number> = {};
  for (const tags of ideasTags) for (const t of canonTags(tags)) counts[t] = (counts[t] || 0) + 1;
  return Object.keys(counts)
    .filter((t) => counts[t] >= MIN_COUNT)
    .sort((a, b) => counts[b] - counts[a] || a.localeCompare(b))
    .slice(0, MAX_TAGS)
    .map((t) => ({ t, n: counts[t] }));
}
