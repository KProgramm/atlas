# Milestone 5 — Spaced Repetition Updates

## Objective

A completed review session (M4) currently just records scores on the
`ReviewSession` row and stops there. M5 makes that result actually mean
something for scheduling: after a session finishes, the problem's
`UserProblem` row updates so the daily queue (M3) reflects how well it
actually went.

## Scope

- `services/mastery.ts` — new module, pure functions + one DB write:
  - `intervalForStage(reviewStage)` — fixed schedule in days:
    `[1, 3, 7, 14, 30, 60]`, indexed by stage, clamped at both ends.
    Deliberately not a full SM-2 ease-factor system — simpler to reason
    about and explain, and plenty for a solo-tracked problem set.
  - `nextReviewStage(currentStage, overallConfidence)` — advances a stage
    on a passing score (>= 70), pulls back a stage on a failing score
    (< 50), holds steady in between.
  - `nextMasteryScore(currentScore, totalReviews, overallConfidence)` —
    exponential moving average (60% weight to the newest session, since
    interview-explanation skill reflects current state more than a
    lifetime average); first review sets the score directly.
  - `applyReviewOutcome(userProblemId, overallConfidence)` — reads the
    current `UserProblem`, computes the above, writes back
    `reviewStage`, `masteryScore`, `nextReviewAt`, `lastReviewedAt`, and
    increments `totalReviews`.
  - `services/mastery.test.ts` — unit tests for the three pure functions
    (boundary behavior, clamping, moving-average math), same style as
    `scheduler.test.ts`.
- `services/review.ts` — `finalizeSession` now takes the `userProblemId`
  and calls `applyReviewOutcome` right after writing the session's final
  scores.

## Explicitly out of scope

- Changing `UserProblem.status` (e.g. an eventual "mastered" state) —
  left as `"active"` for now; could be a future addition once there's a
  clear threshold (e.g. `reviewStage` maxed + `masteryScore` above some
  bar) and dashboard support to show it. Not needed for the queue to work
  correctly today.
- Any dashboard surfacing of mastery/streaks — that's M6.

## Verification status

- `services/mastery.test.ts` passes locally (pure functions, no DB or
  network needed).
- `tsc --noEmit` and `eslint` clean.
- NOT yet tested against a live database — `applyReviewOutcome` itself
  needs a real `UserProblem` row and Supabase connection, which this
  sandbox can't reach. Confirm during the same live M4 test: after
  finishing a review session, check that the problem's `nextReviewAt`
  moved forward and it drops off `/review`'s due queue until then.

## Review checklist (fill in after testing live)

- [ ] After a good session (score >= 70), the problem's next review date
      moves further out than before
- [ ] After a weak session (score < 50), the problem comes back sooner
      (or immediately, if it was already at stage 0)
- [ ] The problem disappears from `/review`'s due queue right after
      finishing a session (since `nextReviewAt` is now in the future)
- [ ] `masteryScore` looks like a sane 0-100 number, not something wild
