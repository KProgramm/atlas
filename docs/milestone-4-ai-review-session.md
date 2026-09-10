# Milestone 4 — AI Review Session

## Objective

Let a user actually run a review session on a problem from the queue: answer
a handful of AI-generated questions about it, get graded, and see a
confidence score broken into dimensions. This is the feature that makes
Atlas an interview-prep tool rather than just a tracker.

## Scope

- `services/review.ts`
  - `generateInitialQuestions(problem)` — 3 questions via OpenAI (JSON mode):
    one each for pattern recognition, approach justification, and
    time/space complexity.
  - `gradeAnswer(problem, questionPrompt, userAnswer)` — 0-100 score +
    2-3 sentence feedback for one answer.
  - `generateFollowUp(problem, gradedQuestions)` — one adaptive follow-up
    question once all 3 base questions are answered, targeting the
    candidate's weakest answer (probes deeper if score < 70, pushes further
    with a variation/edge case if score is high).
  - `scoreCommunication(problem, qa)` — one holistic 0-100 clarity score
    across the whole transcript.
  - `startReviewSession(dbUserId, userProblemId)` — creates a
    `ReviewSession` + its 3 initial `Question` rows.
  - `submitAnswer(dbUserId, questionId, userAnswer)` — grades one answer,
    and once all 4 questions (3 base + follow-up) are answered, finalizes
    the session: writes `recognitionScore`, `approachScore`,
    `complexityScore`, `adaptabilityScore`, `communicationScore`, and
    `overallConfidence` (average of the 5) onto the `ReviewSession` row.
  - Every OpenAI call uses `response_format: { type: "json_object" }` plus
    a hand-written parser that throws on anything malformed — never trust
    raw model output straight into the DB.
- `app/api/reviews/start/route.ts` — `POST { userProblemId }` → session +
  its 3 questions.
- `app/api/reviews/answer/route.ts` — `POST { questionId, answer }` →
  either `{ sessionComplete: false, nextQuestion }` or
  `{ sessionComplete: true, scores, questions }`.
- `app/review/session/[userProblemId]/` — client-side flow: one question
  at a time, textarea + submit, then a results screen with a score card
  per dimension and the full graded transcript. Per-question feedback is
  withheld until the session is complete (closer to a real interview).
- `app/review/ReviewRow.tsx` — "Start Review" button enabled, links into
  the new session route.

## Explicitly out of scope (later milestones)

- Updating `UserProblem.masteryScore`, `reviewStage`, `nextReviewAt` based
  on session results — that's M5 (spaced repetition scheduling updates).
- Surfacing review session stats on the dashboard — that's M6.

## Model

`CHAT_MODEL` in `lib/ai.ts` is the single place the model name lives.
Currently `gpt-5.6-luna` — the cheapest current OpenAI model, chosen for
budget reasons. Swap there if quality isn't good enough; nothing else in
the codebase hardcodes a model name.

## Verification status

- `tsc --noEmit` and `eslint` clean across all new/changed files.
- NOT yet tested against real OpenAI behavior — the build sandbox can't
  reach `api.openai.com`. First live test happens in Krish's own
  `npm run dev`, actually completing a review session end to end.

## Review checklist (fill in after testing live)

- [ ] Loading states behave (no hangs, no stuck spinners)
- [ ] Questions are sensible for the problem
- [ ] Grading feedback is coherent and matches answer quality
- [ ] Follow-up question logic feels right (probes weak spot / extends strong one)
- [ ] Results screen shows all 5 scores and full transcript correctly
