import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getCurrentUser() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/**
 * Resolves the signed-in Clerk user to our own User row, creating it on
 * first visit and keeping name/email in sync on every call after that.
 * Cheap upsert, and it means every other piece of code (route handlers,
 * pages) can just ask for "the current user's database id" without each
 * one re-implementing this.
 */
export async function getOrCreateDbUser() {
  const clerkUser = await getCurrentUser();
  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      name: clerkUser.fullName ?? undefined,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName ?? undefined,
    },
  });
}
