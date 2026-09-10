# Milestone 6 — Dashboard

## Objective

Turn the dashboard from a single "problems tracked" stat into the real
home screen: reviews due today, problems tracked, sessions completed,
overall confidence, time spent reviewing, and recent activity. This is
the locked M6 scope from the planning doc's `GET /api/dashboard` contract.

## Scope

- `services/dashboard.ts` — `getDashboardStats(dbUserId)`: pulls the due
  queue (reusing `getDueQueue` from M3), a total problem count, and every
  completed `ReviewSession` for the user in one query, then derives:
  - `reviewsDueToday` — `getDueQueue(...).length`
  - `totalProblems` — count of all tracked `UserProblem` rows
  - `totalReviewsCompleted` — count of completed sessions
  - `overallConfidence` — average `overallConfidence` across completed
    sessions (`null` if none yet)
  - `timeSpentReviewingMinutes` — sum of `completedAt - startedAt` across
    completed sessions
  - `recentActivity` — the 5 most recently completed sessions (problem
    title, completion time, confidence score)
- `app/api/dashboard/route.ts` — `GET`, per the locked contract.
- `app/dashboard/page.tsx` — calls `getDashboardStats` directly (server
  component, same pattern as `/problems` and `/review` — no self-fetch),
  renders 5 stat cards plus a recent-activity list.
- `utils/format.ts` — `formatMinutes` (e.g. `"1h 24m"`) and `formatScore`
  (e.g. `"82%"`, `"—"` when null). First use of `utils/` in the repo,
  matching the folder structure locked in planning (presentation helpers
  live here, not in `services/`).

## Design notes

- One query for all completed sessions, then derive count/average/
  duration/recent-list from that same array in JS rather than four
  separate aggregate queries. Same "filter in JS at this data scale"
  reasoning as `services/scheduler.ts`'s `getDueQueue` — this is a
  personal problem set, not a table with thousands of rows.
- `overallConfidence` is an average across all completed sessions, not
  just the latest one or `masteryScore` per problem — it's meant to read
  as "how am I doing overall," separate from M5's per-problem mastery
  tracking.

## Verification status

- `tsc --noEmit` and `eslint` clean.
- NOT yet tested against live data — needs at least one completed review
  session (M4 + M5 confirmed live) to see real numbers instead of zeros.

## Review checklist (fill in after testing live)

- [ ] Stat cards show real numbers once a review session or two are done
- [ ] "Due for review" count matches what's actually on `/review`
- [ ] Recent activity list shows the right problem titles and reasonable
      timestamps, most recent first
- [ ] Confidence/time formatting looks right (no `NaN`, no negative
      values, no empty crashes with zero sessions)
