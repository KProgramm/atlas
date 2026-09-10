import { prisma } from "@/lib/prisma";
import { getDueQueue } from "@/services/scheduler";

export type RecentActivityItem = {
  id: string;
  problemTitle: string;
  completedAt: Date;
  overallConfidence: number | null;
};

export type DashboardStats = {
  reviewsDueToday: number;
  totalProblems: number;
  totalReviewsCompleted: number;
  overallConfidence: number | null;
  timeSpentReviewingMinutes: number;
  recentActivity: RecentActivityItem[];
};

const RECENT_ACTIVITY_LIMIT = 5;

/**
 * Aggregate stats for the dashboard (Milestone 6). Pulls every completed
 * ReviewSession for the user once and derives count/average/duration/
 * recent-list from that same array in JS, rather than four separate
 * aggregate queries -- simplest option, and fine at this data scale (a
 * personal problem set, not thousands of rows). See services/scheduler.ts
 * for the same "filter in JS, not SQL" reasoning applied to due-queue.
 */
export async function getDashboardStats(dbUserId: string): Promise<DashboardStats> {
  const [dueQueue, totalProblems, completedSessions] = await Promise.all([
    getDueQueue(dbUserId),
    prisma.userProblem.count({ where: { userId: dbUserId } }),
    prisma.reviewSession.findMany({
      where: {
        completedAt: { not: null },
        userProblem: { userId: dbUserId },
      },
      include: { userProblem: { include: { problem: true } } },
      orderBy: { completedAt: "desc" },
    }),
  ]);

  const totalReviewsCompleted = completedSessions.length;

  const overallConfidence =
    totalReviewsCompleted === 0
      ? null
      : completedSessions.reduce((sum, s) => sum + (s.overallConfidence ?? 0), 0) /
        totalReviewsCompleted;

  const timeSpentReviewingMs = completedSessions.reduce((sum, s) => {
    if (!s.completedAt) return sum;
    return sum + (s.completedAt.getTime() - s.startedAt.getTime());
  }, 0);

  const recentActivity: RecentActivityItem[] = completedSessions
    .slice(0, RECENT_ACTIVITY_LIMIT)
    .map((s) => ({
      id: s.id,
      problemTitle: s.userProblem.problem.title,
      // Safe to assert: the where clause above only selects sessions
      // with completedAt not null.
      completedAt: s.completedAt as Date,
      overallConfidence: s.overallConfidence,
    }));

  return {
    reviewsDueToday: dueQueue.length,
    totalProblems,
    totalReviewsCompleted,
    overallConfidence,
    timeSpentReviewingMinutes: Math.round(timeSpentReviewingMs / 60000),
    recentActivity,
  };
}
