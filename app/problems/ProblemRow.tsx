"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDaysUntil, formatScore } from "@/utils/format";

const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-green-600 dark:text-green-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-red-600 dark:text-red-400",
};

export function ProblemRow({
  userProblemId,
  title,
  difficulty,
  pattern,
  url,
  masteryScore,
  totalReviews,
  nextReviewAt,
}: {
  userProblemId: string;
  title: string;
  difficulty: string;
  pattern: string | null;
  url: string | null;
  masteryScore: number;
  totalReviews: number;
  nextReviewAt: Date | null;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/problems/${userProblemId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
    } else {
      setDeleting(false);
    }
  }

  return (
    <li className="flex items-center justify-between gap-4 py-4">
      <div>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {title}
          </a>
        ) : (
          <span className="font-medium text-zinc-900 dark:text-zinc-50">
            {title}
          </span>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <span className={DIFFICULTY_COLOR[difficulty] ?? ""}>{difficulty}</span>
          {pattern && <span>· {pattern}</span>}
          {totalReviews > 0 && (
            <>
              <span>· mastery {formatScore(masteryScore)}</span>
              {nextReviewAt && <span>· next review {formatDaysUntil(nextReviewAt)}</span>}
            </>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-sm text-zinc-500 hover:text-red-600 disabled:opacity-50 dark:text-zinc-400 dark:hover:text-red-400"
      >
        {deleting ? "Removing..." : "Remove"}
      </button>
    </li>
  );
}
