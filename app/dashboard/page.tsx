import { getOrCreateDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const user = await getOrCreateDbUser();

  const problemCount = await prisma.userProblem.count({
    where: { userId: user.id },
  });

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
          {problemCount === 0
            ? "You haven't imported any problems yet."
            : `You're tracking ${problemCount} problem${problemCount === 1 ? "" : "s"}.`}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Problems tracked</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {problemCount}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Due for review</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">—</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Review sessions</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">—</p>
          </div>
        </div>
      </main>
    </div>
  );
}
