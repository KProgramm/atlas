# Atlas — Agent Instructions

## Project
Atlas is an AI-powered LeetCode spaced-repetition review app.

## Stack
Next.js 16, TypeScript, Tailwind CSS, PostgreSQL, Prisma, Clerk, OpenAI API, Vercel

## Architecture Rules
- Frontend: UI only. Zero business logic.
- Backend: Route Handlers own all business logic, DB access, and OpenAI calls.
- DB: PostgreSQL via Prisma. Data only. No AI logic.
- AI: OpenAI generates questions, grades responses, gives feedback. Never touches DB directly.
- Auth: Clerk handles everything. No custom auth.

## Agent Rules
1. Do not modify files outside your assigned task scope.
2. Do not add dependencies without explaining why.
3. Run npm run build and fix any TypeScript errors before finishing.
4. Never claim a task is complete without verifying it builds.
5. Keep changes minimal and focused.
