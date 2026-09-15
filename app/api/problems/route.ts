import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import {
  DIFFICULTIES,
  createProblemForUser,
  listProblemsForUser,
} from "@/services/problems";

// GET /api/problems -- list the signed-in user's problem library
export async function GET() {
  const user = await getOrCreateDbUser();
  const problems = await listProblemsForUser(user.id);
  return NextResponse.json({ problems });
}

// POST /api/problems -- add a problem to the signed-in user's library
export async function POST(request: NextRequest) {
  const user = await getOrCreateDbUser();
  const body = await request.json();

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const difficulty =
    typeof body.difficulty === "string" ? body.difficulty.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (!DIFFICULTIES.includes(difficulty as (typeof DIFFICULTIES)[number])) {
    return NextResponse.json(
      { error: `difficulty must be one of: ${DIFFICULTIES.join(", ")}` },
      { status: 400 }
    );
  }

  const userProblem = await createProblemForUser(user.id, {
    title,
    difficulty,
    pattern: typeof body.pattern === "string" ? body.pattern.trim() : undefined,
    url: typeof body.url === "string" ? body.url.trim() : undefined,
    tags: Array.isArray(body.tags) ? body.tags : undefined,
    leetcodeId:
      typeof body.leetcodeId === "number" ? body.leetcodeId : undefined,
    notes: typeof body.notes === "string" ? body.notes.trim() : undefined,
  });

  return NextResponse.json({ userProblem }, { status: 201 });
}
