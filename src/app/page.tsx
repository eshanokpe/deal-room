import { redirect } from "next/navigation";
import { getDbUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getDbUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}