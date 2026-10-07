# Atlas

An AI-powered spaced-repetition app for LeetCode review, built to solve a real problem: solving 300+ problems and still forgetting how half of them work a few weeks later.

Most spaced-repetition tools are built for flashcards and static facts. Atlas is built for procedural, pattern-based knowledge instead. Given a problem you've solved before, can you still recognize which approach it needs, reason through the complexity, and explain your thinking out loud, without re-reading your old solution?

## How it works

- Add problems you've solved, either from a built-in catalog or as custom entries.
- When a problem comes up for review, Atlas generates adaptive questions with OpenAI covering pattern recognition, approach, time/space complexity, and communication, then asks a follow-up targeted at wherever your answer was weakest.
- Each answer is graded across five dimensions, and the result feeds a spaced-repetition scheduler that adjusts when the problem comes back: stronger sessions push it further out, weaker ones bring it back sooner.
- A dashboard tracks review stats, mastery over time, and recent activity.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- Clerk for authentication
- PostgreSQL (Supabase) via Prisma ORM
- OpenAI API for question generation and grading

## Architecture

- `app/` – UI only, no business logic
- `app/api/` – thin REST route handlers: parse the request, call a service, return JSON
- `services/` – all business logic; the only layer that talks to Prisma
- `prisma/schema.prisma` – data model: User, Problem, UserProblem, ReviewSession, Question

AI never touches the database directly. `services/review.ts` is what persists whatever OpenAI returns.

## Getting started

```bash
npm install
# add your own DATABASE_URL, Clerk keys, and an OpenAI API key to .env.local
npx prisma generate
npx prisma db push
npm run dev
```

## Testing

```bash
npm test
```

Unit tests cover the spaced-repetition scheduling and mastery-scoring logic (19 tests, scheduler and mastery services).
