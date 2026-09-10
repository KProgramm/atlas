import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { startReviewSession } from "@/services/review";

// POST /api/reviews/start -- begin a review session for one UserProblem.
// Body: { userProblemId: string }
// Calls OpenAI to generate the 3 initial questions, so this can take a
// couple seconds -- the frontend should show a loading state.
export async function POST(request: NextRequest) {
  const user = await getOrCreateDbUser();
  const body = await request.json();
  const userProblemId = body?.userProblemId;

  if (typeof userProblemId !== "string" || !userProblemId) {
    return NextResponse.json({ error: "userProblemId is required" }, { status: 400 });
  }

  const session = await startReviewSession(user.id, userProblemId);
  if (!session) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ session });
}
