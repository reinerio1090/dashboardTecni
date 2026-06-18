import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import pool from "@/lib/db";
import MetasSucursalesClient from "@/components/dashboard/MetasSucursalesClient";

export default async function MetasSucursalesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = verifyAuthToken(token);

  if (!session) {
    redirect("/login");
  }

  const [rows]: any = await pool.query(
    `
    SELECT COALESCE(acceso_rutas, 0) AS accesoRutas
    FROM dashboard_users
    WHERE id = ?
    LIMIT 1
    `,
    [session.id]
  );
  const accesoRutas = Number(rows?.[0]?.accesoRutas ?? 0) === 1;

  return <MetasSucursalesClient accesoRutas={accesoRutas} />;
}
