"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DIFFICULTIES } from "@/services/problems";

// Client component: owns form state and talks to the REST API.
// No Prisma import here on purpose -- the frontend never touches the
// database directly, it only calls app/api/problems (see architecture
// doc: "frontend should never contain business logic").
export function AddProblemForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTIES[0]);
  const [url, setUrl] = useState("");
  const [pattern, setPattern] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/problems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        difficulty,
        url: url || undefined,
        pattern: pattern || undefined,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong");
      return;
    }

    setTitle("");
    setUrl("");
    setPattern("");
    // Re-runs the server component (ProblemsPage) so the new row shows up
    // without us having to duplicate the fetched list in client state.
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1 min-w-[160px]">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Two Sum"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">Difficulty</label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        >
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-[160px]">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">
          Pattern (optional)
        </label>
        <input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="Two Pointers"
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-[160px]">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">
          URL (optional)
        </label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://leetcode.com/..."
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {submitting ? "Adding..." : "Add problem"}
      </button>

      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
