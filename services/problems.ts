import { prisma } from "@/lib/prisma";

export const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type CreateProblemInput = {
  title: string;
  difficulty: string;
  pattern?: string;
  tags?: string[];
  url?: string;
  leetcodeId?: number;
  // Context shown at the start of a review session so an old problem is
  // recognizable by more than its title (services/review.ts). Written to
  // originalNotes -- the schema already had this field, unused until now.
  notes?: string;
};

/**
 * Every problem a user is tracking, newest import first.
 * Joins UserProblem -> Problem so the caller gets both the shared
 * problem data (title, difficulty, ...) and the user-specific tracking
 * data (status, masteryScore, ...) in one shot.
 */
export async function listProblemsForUser(dbUserId: string) {
  return prisma.userProblem.findMany({
    where: { userId: dbUserId },
    include: { problem: true },
    orderBy: { importedAt: "desc" },
  });
}

/**
 * Adds a problem to a user's library.
 *
 * Problem (the catalog entry: title/difficulty/tags/...) and UserProblem
 * (this user's tracking record for it) are separate tables on purpose --
 * multiple users can track the same Problem without duplicating its data.
 * Milestone 2 is manual-add only, so we don't try to dedupe against an
 * existing Problem row yet; that matters once LeetCode sync (a later
 * milestone) can hand us the same leetcodeId twice.
 */
export async function createProblemForUser(
  dbUserId: string,
  input: CreateProblemInput
) {
  const problem = await prisma.problem.create({
    data: {
      title: input.title,
      difficulty: input.difficulty,
      pattern: input.pattern || null,
      tags: input.tags ?? [],
      url: input.url || null,
      leetcodeId: input.leetcodeId,
      source: "manual",
    },
  });

  return prisma.userProblem.create({
    data: {
      userId: dbUserId,
      problemId: problem.id,
      source: "manual",
      originalNotes: input.notes || null,
    },
    include: { problem: true },
  });
}

/**
 * Removes a problem from a user's library. Only deletes the UserProblem
 * link (this user's tracking record) -- never the shared Problem row,
 * since other users may also be tracking it.
 *
 * Returns false instead of throwing if the UserProblem doesn't exist or
 * belongs to someone else, so the route handler can turn that into a
 * clean 404 rather than leaking whether some other user's row exists.
 */
export async function deleteUserProblem(dbUserId: string, userProblemId: string) {
  const result = await prisma.userProblem.deleteMany({
    where: { id: userProblemId, userId: dbUserId },
  });
  return result.count > 0;
}
