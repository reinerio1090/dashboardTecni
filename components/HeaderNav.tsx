import { cookies } from "next/headers";
import Link from "next/link";
import { verifyAuthToken } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function HeaderNav() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = verifyAuthToken(token);

  if (!session) {
    return null;
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <Link href="/dashboard" className="text-xl font-semibold text-[#333333]">
            Tecnifiltro Bermatut Cia Ltda
          </Link>
        </div>

        <nav className="flex flex-wrap items-center gap-3 text-sm text-[#333333]">
          <Link href="/dashboard" className="rounded-full px-4 py-2 hover:bg-gray-100">
            Dashboard
          </Link>
          <Link href="/metas-sucursales" className="rounded-full px-4 py-2 hover:bg-gray-100">
            Metas sucursales
          </Link>
          {session.rol === "admin" && (
            <Link href="/admin" className="rounded-full px-4 py-2 hover:bg-gray-100">
              Panel Admin
            </Link>
          )}
          <div className="rounded-full px-4 py-2">
            <span className="text-xs bg-[#F1C380] text-[#333333] rounded-full px-3 py-1">
              {session.nombre}
            </span>
          </div>
          <LogoutButton />
        </nav>
      </div>
    </header>
  );
}
