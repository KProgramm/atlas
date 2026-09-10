const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "text-green-600 dark:text-green-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-red-600 dark:text-red-400",
};

export function ReviewRow({
  title,
  difficulty,
  pattern,
  url,
  nextReviewAt,
}: {
  title: string;
  difficulty: string;
  pattern: string | null;
  url: string | null;
  nextReviewAt: Date | null;
}) {
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
          <span>· {nextReviewAt === null ? "New" : "Due"}</span>
        </div>
      </div>
      <button
        type="button"
        disabled
        title="Coming in Milestone 4"
        className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-400 disabled:cursor-not-allowed dark:border-zinc-700 dark:text-zinc-500"
      >
        Start Review
      </button>
    </li>
  );
}
