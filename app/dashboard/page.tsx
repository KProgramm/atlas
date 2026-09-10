import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      name: clerkUser.fullName ?? undefined,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName ?? undefined,
    },
  });

  const problemCount = await prisma.userProblem.count({
    where: { userId: user.id },
  });

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 sm:px-10">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back{user.name ? `, ${user.name}` : ""}
        </h1>
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
