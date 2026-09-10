import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { getDueQueue } from "@/services/scheduler";

// GET /api/reviews/queue -- the signed-in user's due review queue.
// Same row shape as GET /api/problems (UserProblem with `problem` included).
export async function GET() {
  const user = await getOrCreateDbUser();
  const queue = await getDueQueue(user.id);
  return NextResponse.json({ queue });
}
