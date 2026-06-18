import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  redirect(verifyAuthToken(token) ? "/dashboard" : "/login");
}
