import { auth, currentUser } from "@clerk/nextjs/server";

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
