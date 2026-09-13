import { prisma } from "@/lib/prisma";

// After a review session finishes, this decides how a UserProblem's
// spaced-repetition state moves: does the next review come sooner or
// later, and does the running "mastery" number go up or down.
//
// Deliberately a fixed interval schedule rather than a full SM-2
// ease-factor system -- simpler to reason about and explain, and plenty
// for a solo-tracked problem set. The pure calculation functions are kept
// separate from the DB write (applyReviewOutcome), same pattern as
// services/scheduler.ts's isDue().

// Index = reviewStage, value = days until the next review.
const INTERVAL_DAYS = [1, 3, 7, 14, 30, 60];

export function intervalForStage(reviewStage: number): number {
  const index = Math.min(Math.max(reviewStage, 0), INTERVAL_DAYS.length - 1);
  return INTERVAL_DAYS[index];
}

// Strong session (>= PASS_THRESHOLD): advance a stage, next review is
// further out. Weak session (< FAIL_THRESHOLD): pull back a stage, it
// needs more frequent review. In between: hold steady, try again at the
// same interval.
export const PASS_THRESHOLD = 70;
export const FAIL_THRESHOLD = 50;

export function nextReviewStage(currentStage: number, overallConfidence: number): number {
  if (overallConfidence >= PASS_THRESHOLD) {
    return Math.min(currentStage + 1, INTERVAL_DAYS.length - 1);
  }
  if (overallConfidence < FAIL_THRESHOLD) {
    return Math.max(currentStage - 1, 0);
  }
  return currentStage;
}

// Exponential moving average, weighted toward the most recent session --
// interview-explanation skill reflects current state more than lifetime
// average. The first review has nothing to average against, so it just
// sets the score directly.
export const RECENCY_WEIGHT = 0.6;

export function nextMasteryScore(
  currentScore: number,
  totalReviews: number,
  overallConfidence: number
): number {
  if (totalReviews === 0) return overallConfidence;
  return currentScore * (1 - RECENCY_WEIGHT) + overallConfidence * RECENCY_WEIGHT;
}

/**
 * Called once a ReviewSession is finalized (services/review.ts). Reads
 * the UserProblem's current spaced-repetition state, computes the next
 * stage/mastery/due date, and writes it back in one update.
 */
export type ReviewOutcome = {
  reviewStage: number;
  masteryScore: number;
  nextReviewAt: Date;
};

export async function applyReviewOutcome(
  userProblemId: string,
  overallConfidence: number
): Promise<ReviewOutcome> {
  const userProblem = await prisma.userProblem.findUniqueOrThrow({
    where: { id: userProblemId },
  });

  const reviewStage = nextReviewStage(userProblem.reviewStage, overallConfidence);
  const masteryScore = nextMasteryScore(
    userProblem.masteryScore,
    userProblem.totalReviews,
    overallConfidence
  );

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + intervalForStage(reviewStage));

  // Returned (not just written) so the caller can show the result right
  // away -- e.g. "next review in 3 days" on the session results screen --
  // instead of it silently living only on the UserProblem row. Krish
  // flagged during review that there was no way to see this without
  // querying the DB directly.
  await prisma.userProblem.update({
    where: { id: userProblemId },
    data: {
      reviewStage,
      masteryScore,
      nextReviewAt,
      lastReviewedAt: new Date(),
      totalReviews: { increment: 1 },
    },
  });

  return { reviewStage, masteryScore, nextReviewAt };
}
