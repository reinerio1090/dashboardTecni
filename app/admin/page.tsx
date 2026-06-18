import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdminSession } from "@/lib/auth";
import AdminClient from "@/components/admin/AdminClient";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = isAdminSession(token);

  if (!session) {
    redirect("/login");
  }

  return <AdminClient />;
}
