import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function getDbUser() {
  const userId = await getSessionUserId();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  return user;
}

export async function requireDbUser() {
  const user = await getDbUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}