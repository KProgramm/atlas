import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { submitAnswer } from "@/services/review";

// POST /api/reviews/answer -- submit an answer to one question in an
// in-progress review session. Body: { questionId: string, answer: string }
// Grades the answer via OpenAI and, if this was the last base question,
// also generates the adaptive follow-up (or finalizes the session if it
// was the follow-up itself) -- all in this one call, so again: can take
// a couple seconds, frontend should show a loading state.
export async function POST(request: NextRequest) {
  const user = await getOrCreateDbUser();
  const body = await request.json();
  const questionId = body?.questionId;
  const answer = body?.answer;

  if (typeof questionId !== "string" || !questionId) {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 });
  }
  if (typeof answer !== "string" || !answer.trim()) {
    return NextResponse.json({ error: "answer is required" }, { status: 400 });
  }

  const result = await submitAnswer(user.id, questionId, answer);
  if (!result) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
