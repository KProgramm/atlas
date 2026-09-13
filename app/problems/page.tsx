import Link from "next/link";
import { getOrCreateDbUser } from "@/lib/auth";
import { listProblemsForUser } from "@/services/problems";
import { AddProblemForm } from "./AddProblemForm";
import { ProblemRow } from "./ProblemRow";

export default async function ProblemsPage() {
  const user = await getOrCreateDbUser();
  const problems = await listProblemsForUser(user.id);

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
          Problem Library
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Problems you&apos;re tracking. Add one below.
        </p>

        <div className="mt-8">
          <AddProblemForm />
        </div>

        <ul className="mt-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {problems.length === 0 && (
            <li className="py-6 text-sm text-zinc-500 dark:text-zinc-400">
              No problems yet -- add your first one above.
            </li>
          )}
          {problems.map((userProblem) => (
            <ProblemRow
              key={userProblem.id}
              userProblemId={userProblem.id}
              title={userProblem.problem.title}
              difficulty={userProblem.problem.difficulty}
              pattern={userProblem.problem.pattern}
              url={userProblem.problem.url}
              masteryScore={userProblem.masteryScore}
              totalReviews={userProblem.totalReviews}
              nextReviewAt={userProblem.nextReviewAt}
            />
          ))}
        </ul>
      </main>
    </div>
  );
}
