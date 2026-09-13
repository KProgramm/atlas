// Small display-formatting helpers shared across pages. Kept separate from
// services/ since these are pure presentation, not business logic.

export function formatMinutes(totalMinutes: number): string {
  if (totalMinutes <= 0) return "0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatScore(score: number | null): string {
  return score === null ? "—" : `${Math.round(score)}%`;
}

/**
 * "tomorrow", "in 3 days", "in 2 weeks" -- used right after a review
 * session so the spaced-repetition result (Milestone 5) is visible
 * instead of only living on the UserProblem row in the DB.
 */
export function formatDaysUntil(date: Date): string {
  const msPerDay = 24 * 60 * 60 * 1000;
  const days = Math.round((date.getTime() - Date.now()) / msPerDay);
  if (days <= 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 14) return `in ${days} days`;
  const weeks = Math.round(days / 7);
  return `in ${weeks} week${weeks === 1 ? "" : "s"}`;
}
