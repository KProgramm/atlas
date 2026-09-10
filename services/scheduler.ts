import { prisma } from "@/lib/prisma";

/**
 * A UserProblem is due for review when it's still being actively tracked
 * and either has never been reviewed (nextReviewAt null -> due now) or
 * its scheduled review time has passed.
 */
export function isDue(userProblem: {
  status: string;
  nextReviewAt: Date | null;
}): boolean {
  if (userProblem.status !== "active") return false;
  if (userProblem.nextReviewAt === null) return true;
  return userProblem.nextReviewAt <= new Date();
}

/**
 * The signed-in user's due review queue: active problems whose review is
 * due, oldest-due first so the most overdue surface at the top.
 *
 * Prisma can't cleanly express "nextReviewAt is null OR nextReviewAt <=
 * now" in a single where clause, so we fetch the user's active problems
 * and filter with isDue() in JS. Fine at this data scale.
 */
export async function getDueQueue(dbUserId: string) {
  const active = await prisma.userProblem.findMany({
    where: { userId: dbUserId, status: "active" },
    include: { problem: true },
    orderBy: { nextReviewAt: "asc" },
  });

  return active.filter(isDue);
}
