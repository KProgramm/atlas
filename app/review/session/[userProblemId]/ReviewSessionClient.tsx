"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Question = { id: string; type: string; prompt: string };
type GradedQuestion = {
  type: string;
  prompt: string;
  userAnswer: string | null;
  aiScore: number | null;
  aiFeedback: string | null;
};
type Scores = {
  recognitionScore: number | null;
  approachScore: number | null;
  complexityScore: number | null;
  adaptabilityScore: number | null;
  communicationScore: number;
  overallConfidence: number;
};

const TYPE_ORDER: Record<string, number> = {
  pattern: 0,
  approach: 1,
  complexity: 2,
  follow_up: 3,
};
const TYPE_LABEL: Record<string, string> = {
  pattern: "Pattern",
  approach: "Approach",
  complexity: "Complexity",
  follow_up: "Follow-up",
};

type Phase = "loading" | "answering" | "submitting" | "results" | "error";

// Walks the user through a review session one question at a time.
// The first 3 questions (pattern/approach/complexity) all come back from
// the initial POST /api/reviews/start call -- we don't need the server to
// tell us what's next until the adaptive follow-up shows up, which only
// exists once all 3 base questions are answered. See services/review.ts
// for why per-question feedback isn't revealed until the whole session is
// done (closer to a real interview -- you don't get graded mid-answer).
export function ReviewSessionClient({ userProblemId }: { userProblemId: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [scores, setScores] = useState<Scores | null>(null);
  const [gradedQuestions, setGradedQuestions] = useState<GradedQuestion[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const res = await fetch("/api/reviews/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userProblemId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to start review");
        }
        const data = await res.json();
        if (cancelled) return;

        const sorted = [...data.session.questions].sort(
          (a: Question, b: Question) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
        );
        setQuestions(sorted);
        setPhase("answering");
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
          setPhase("error");
        }
      }
    }

    start();
    return () => {
      cancelled = true;
    };
  }, [userProblemId]);

  async function handleSubmit() {
    if (!answerText.trim()) return;
    setPhase("submitting");
    setError(null);

    try {
      const question = questions[currentIndex];
      const res = await fetch("/api/reviews/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answer: answerText }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to submit answer");
      }
      const data = await res.json();
      setAnswerText("");

      if (data.sessionComplete) {
        setScores(data.scores);
        setGradedQuestions(data.questions);
        setPhase("results");
        return;
      }

      if (data.nextQuestion) {
        setQuestions((prev) => [...prev, data.nextQuestion]);
      }
      setCurrentIndex((i) => i + 1);
      setPhase("answering");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setPhase("answering");
    }
  }

  if (phase === "loading") {
    return (
      <p className="mt-8 text-zinc-600 dark:text-zinc-400">
        Generating your questions&hellip;
      </p>
    );
  }

  if (phase === "error" && questions.length === 0) {
    return (
      <div className="mt-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Link
          href="/review"
          className="mt-4 inline-block text-sm text-zinc-500 hover:underline dark:text-zinc-400"
        >
          &larr; Back to queue
        </Link>
      </div>
    );
  }

  if (phase === "results" && scores) {
    return (
      <div className="mt-8 space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <ScoreCard label="Pattern recognition" value={scores.recognitionScore} />
          <ScoreCard label="Approach" value={scores.approachScore} />
          <ScoreCard label="Complexity" value={scores.complexityScore} />
          <ScoreCard label="Adaptability" value={scores.adaptabilityScore} />
          <ScoreCard label="Communication" value={scores.communicationScore} />
          <ScoreCard
            label="Overall"
            value={Math.round(scores.overallConfidence)}
            highlight
          />
        </div>

        <div className="space-y-4">
          {gradedQuestions.map((q, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {TYPE_LABEL[q.type] ?? q.type} · {q.aiScore ?? "—"}/100
              </p>
              <p className="mt-1 font-medium text-zinc-900 dark:text-zinc-50">
                {q.prompt}
              </p>
              {q.userAnswer && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {q.userAnswer}
                </p>
              )}
              {q.aiFeedback && (
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  {q.aiFeedback}
                </p>
              )}
            </div>
          ))}
        </div>

        <Link
          href="/review"
          className="inline-block rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to queue
        </Link>
      </div>
    );
  }

  const question = questions[currentIndex];

  return (
    <div className="mt-8 space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Question {currentIndex + 1} of {questions.length}
        {question && ` · ${TYPE_LABEL[question.type] ?? question.type}`}
      </p>
      <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {question?.prompt}
      </p>
      <textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        disabled={phase === "submitting"}
        rows={6}
        placeholder="Explain like you would out loud in an interview..."
        className="w-full rounded-xl border border-zinc-300 bg-white p-4 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
      />
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={phase === "submitting" || !answerText.trim()}
        className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {phase === "submitting" ? "Grading..." : "Submit answer"}
      </button>
    </div>
  );
}

function ScoreCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
      }`}
    >
      <p
        className={`text-xs ${
          highlight ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500 dark:text-zinc-400"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value ?? "—"}</p>
    </div>
  );
}
