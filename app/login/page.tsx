import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (verifyAuthToken(token)) {
    redirect("/dashboard");
  }
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}