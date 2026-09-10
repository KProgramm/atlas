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
