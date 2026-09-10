import Link from "next/link";
import { getOrCreateDbUser } from "@/lib/auth";
import { getDueQueue } from "@/services/scheduler";
import { ReviewRow } from "./ReviewRow";

export default async function ReviewPage() {
  const user = await getOrCreateDbUser();
  const queue = await getDueQueue(user.id);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:px-10">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          &larr; Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Daily Review Queue
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Problems due for review today.
        </p>

        <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {queue.length === 0 && (
            <li className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
              Nothing due right now -- you&apos;re all caught up.
            </li>
          )}
          {queue.map((userProblem) => (
            <ReviewRow
              key={userProblem.id}
              id={userProblem.id}
              title={userProblem.problem.title}
              difficulty={userProblem.problem.difficulty}
              pattern={userProblem.problem.pattern}
              url={userProblem.problem.url}
              nextReviewAt={userProblem.nextReviewAt}
            />
          ))}
        </ul>
      </main>
    </div>
  );
}
