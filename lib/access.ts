import pool from "@/lib/db";
import type { AuthPayload } from "@/lib/auth";

export async function getUserSucursalIds(session: AuthPayload) {
  const [rows]: any = await pool.query(
    `
    SELECT id_sucursal AS id
    FROM dashboard_user_sucursales
    WHERE id_usuario = ?
    `,
    [session.id]
  );

  return (rows || [])
    .map((row: { id: number | string }) => Number(row.id))
    .filter((id: number) => Number.isInteger(id) && id > 0);
}

export function getPlaceholders(values: unknown[]) {
  return values.map(() => "?").join(",");
}
