"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { DIFFICULTIES } from "@/services/problems";
import { PROBLEM_CATALOG, type CatalogEntry } from "@/lib/problem-catalog";

const MAX_SUGGESTIONS = 8;

// Client component: owns form state and talks to the REST API.
// No Prisma import here on purpose -- the frontend never touches the
// database directly, it only calls app/api/problems (see architecture
// doc: "frontend should never contain business logic").
//
// The title field is a typeahead against lib/problem-catalog.ts rather
// than a bare text input. Picking a suggestion fills in the correct
// canonical title plus difficulty/pattern/URL/description in one go --
// free typing without picking one is still allowed (not every solved
// problem is in the curated list), it just no longer defaults to
// whatever half-remembered title the user types.
export function AddProblemForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<string>(DIFFICULTIES[0]);
  const [url, setUrl] = useState("");
  const [pattern, setPattern] = useState("");
  const [notes, setNotes] = useState("");
  const [matched, setMatched] = useState<CatalogEntry | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = useMemo(() => {
    const query = title.trim().toLowerCase();
    if (!query) return [];
    return PROBLEM_CATALOG.filter((entry) =>
      entry.title.toLowerCase().includes(query)
    ).slice(0, MAX_SUGGESTIONS);
  }, [title]);

  function handleTitleChange(value: string) {
    setTitle(value);
    setShowSuggestions(true);
    if (matched && value !== matched.title) setMatched(null);
  }

  function pickSuggestion(entry: CatalogEntry) {
    setTitle(entry.title);
    setDifficulty(entry.difficulty);
    setPattern(entry.pattern);
    setUrl(entry.url);
    setNotes(entry.description);
    setMatched(entry);
    setShowSuggestions(false);
  }

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
        notes: notes || undefined,
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
    setNotes("");
    setMatched(null);
    // Re-runs the server component (ProblemsPage) so the new row shows up
    // without us having to duplicate the fetched list in client state.
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative flex flex-1 flex-col gap-1 min-w-[160px]">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Title</label>
          <input
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
            placeholder="Start typing a problem name..."
            autoComplete="off"
            className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute top-full z-10 mt-1 w-full max-h-64 overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              {suggestions.map((entry) => (
                <li key={entry.title}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickSuggestion(entry)}
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">
                      {entry.title}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.difficulty} · {entry.pattern}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {matched ? (
              <span className="text-green-600 dark:text-green-400">
                ✓ matched: {matched.title} ({matched.difficulty})
              </span>
            ) : (
              "No catalog match yet -- will be added as a custom problem."
            )}
          </p>
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
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-500 dark:text-zinc-400">
          Notes / description (optional, shown when you review this problem later)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="What the problem asks, or anything you want to remember about it..."
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {submitting ? "Adding..." : "Add problem"}
        </button>
      </div>

      {error && <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
