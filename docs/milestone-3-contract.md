# Milestone 3 contract — Daily Review Queue

Locked before backend/frontend/tests start in parallel. Don't deviate
without updating this file and telling the other two agents.

## Scope

Read-side only. "Due" problems + a way to see them. NOT the review
session itself (AI questions/grading is Milestone 4, blocked on the
OpenAI key) and NOT writing new mastery/review-stage values after a
session (Milestone 5). This milestone just answers: "what's due today,
and can I see the list."

## Due logic (services/scheduler.ts)

A UserProblem is due when:
- `status === "active"`, AND
- `nextReviewAt === null` (never reviewed -- due immediately) OR `nextReviewAt <= now`

```ts
export function isDue(userProblem: { status: string; nextReviewAt: Date | null }): boolean {
  if (userProblem.status !== "active") return false;
  if (userProblem.nextReviewAt === null) return true;
  return userProblem.nextReviewAt <= new Date();
}

export async function getDueQueue(dbUserId: string) {
  // Prisma can't express "nextReviewAt is null OR nextReviewAt <= now"
  // as cleanly as the isDue() helper above, so fetch active problems
  // and filter in JS. Fine at this data scale.
}
```

## Backend

- `services/scheduler.ts`: `isDue()` + `getDueQueue(dbUserId)` as above
- `app/api/reviews/queue/route.ts`: `GET` -- returns `{ queue: UserProblem[] }`
  (same shape as `services/problems.ts` list, `problem` included) for the
  signed-in user, using `getOrCreateDbUser()` from `lib/auth.ts` same as
  the existing `/api/problems` routes

## Frontend

- `app/review/page.tsx`: server component, same visual pattern as
  `app/problems/page.tsx` (see that file + `ProblemRow.tsx` for the
  style/layout to match) -- lists the due queue
- Each row gets a "Start Review" button. Milestone 4 doesn't exist yet,
  so it's a disabled button for now with a `title="Coming in Milestone 4"`
  tooltip -- don't build a fake review flow, don't stub a route that'll
  just get replaced
- Add a link to `/review` from the dashboard, same pattern as the
  existing `/problems` link

## Tests

- No test runner exists in this repo yet (checked package.json --
  nothing). First job is adding one: `vitest` is the fastest fit for a
  Next.js + TS project, not `jest` (no extra config needed for ESM/TS)
- Once installed: unit tests for `isDue()` covering the three branches
  (inactive status, null nextReviewAt, past vs future nextReviewAt) and
  an integration test for `GET /api/reviews/queue` if the route-testing
  setup is straightforward -- don't burn time on heavy route-handler
  mocking if it fights Next.js's App Router conventions, unit coverage
  on the scheduler logic is the higher-value target
