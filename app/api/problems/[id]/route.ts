import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/auth";
import { deleteUserProblem } from "@/services/problems";

// DELETE /api/problems/:id -- remove a problem from the signed-in user's
// library. :id is the UserProblem id (the tracking row), not the Problem
// itself -- see services/problems.ts for why those are separate tables.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getOrCreateDbUser();
  const { id } = await params;

  const deleted = await deleteUserProblem(user.id, id);
  if (!deleted) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
