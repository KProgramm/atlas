import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { getDashboardStats } from "@/services/dashboard";

// GET /api/dashboard -- aggregate stats for the signed-in user's dashboard:
// reviews due today, total problems tracked, total reviews completed,
// overall confidence, time spent reviewing, and recent review activity.
export async function GET() {
  const user = await getOrCreateDbUser();
  const stats = await getDashboardStats(user.id);
  return NextResponse.json({ stats });
}
