// The heuristic score shown across the UI: the AI's gut-feel score plus community votes,
// with each net vote worth a lot (only a few voters, so every vote should move it).
// This is the number the scoreboard ranks by and the panel displays.
export const VOTE_WEIGHT = 5;

export function heuristicScore(aiScore: number, votes: number): number {
  const base = Number.isFinite(aiScore) ? aiScore : 55;
  return Math.round(base + VOTE_WEIGHT * (votes || 0));
}
