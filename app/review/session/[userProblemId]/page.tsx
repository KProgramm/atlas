import Link from "next/link";
import { ReviewSessionClient } from "./ReviewSessionClient";

export default async function ReviewSessionPage({
  params,
}: {
  params: Promise<{ userProblemId: string }>;
}) {
  const { userProblemId } = await params;

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 sm:px-10">
        <Link
          href="/review"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          &larr; Queue
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Review Session
        </h1>
        <ReviewSessionClient userProblemId={userProblemId} />
      </main>
    </div>
  );
}
