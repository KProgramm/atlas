import Link from "next/link";
import { getOrCreateDbUser } from "@/lib/auth";
import { getDashboardStats } from "@/services/dashboard";
import { formatMinutes, formatScore } from "@/utils/format";

export default async function DashboardPage() {
  const user = await getOrCreateDbUser();
  const stats = await getDashboardStats(user.id);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 sm:px-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back{user.name ? `, ${user.name}` : ""}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/review"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Daily Review
            </Link>
            <Link
              href="/problems"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Problem Library
            </Link>
          </div>
        </div>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {stats.totalProblems === 0
            ? "You haven't imported any problems yet."
            : `You're tracking ${stats.totalProblems} problem${stats.totalProblems === 1 ? "" : "s"}.`}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Problems tracked" value={String(stats.totalProblems)} />
          <StatCard label="Due for review" value={String(stats.reviewsDueToday)} />
          <StatCard label="Review sessions" value={String(stats.totalReviewsCompleted)} />
          <StatCard label="Overall confidence" value={formatScore(stats.overallConfidence)} />
          <StatCard
            label="Time spent reviewing"
            value={formatMinutes(stats.timeSpentReviewingMinutes)}
          />
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Recent activity
          </h2>
          {stats.recentActivity.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Complete a review session to see it here.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
              {stats.recentActivity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {item.problemTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                      {item.completedAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {formatScore(item.overallConfidence)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}
