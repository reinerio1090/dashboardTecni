import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = verifyAuthToken(token);

  if (!session) {
    redirect("/login");
  }

  return <DashboardClient />;
}
