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
 * "today (Sep 15)", "tomorrow (Sep 16)", "Sep 20" -- used on the review
 * results screen and the Problem Library so Milestone 5's result is
 * actually visible instead of only living on the UserProblem row.
 *
 * `null` means never reviewed -- services/scheduler.ts's isDue() treats
 * that as due right now, so this does too, rather than showing nothing.
 *
 * Compares calendar dates (local midnight to midnight), not raw
 * millisecond deltas -- a naive `Math.round(ms / oneDay)` misreads "3
 * days from now, but it's evening" as "0 days away" and displays
 * "today" for a date that's actually tomorrow. Comparing dates you can
 * point to on a calendar avoids that.
 */
export function formatReviewDate(date: Date | null): string {
  if (date === null) return "due now";

  const dateLabel = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTarget = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.round((startOfTarget.getTime() - startOfToday.getTime()) / dayMs);

  if (diffDays <= 0) return `today (${dateLabel})`;
  if (diffDays === 1) return `tomorrow (${dateLabel})`;
  return dateLabel;
}
