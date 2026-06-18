"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full px-4 py-2 hover:bg-red-50 text-red-600"
    >
      Salir
    </button>
  );
}
