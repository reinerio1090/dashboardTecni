import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { getPlaceholders, getUserSucursalIds } from "@/lib/access";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value;
    const session = verifyAuthToken(token);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "No autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sucursalCodigo = searchParams.get("codigoSucursal");
    const sucursalIds = await getUserSucursalIds(session);
    const [accessRows]: any = await pool.query(
      `
      SELECT COALESCE(acceso_rutas, 0) AS accesoRutas
      FROM dashboard_users
      WHERE id = ?
      LIMIT 1
      `,
      [session.id]
    );
    const tieneAccesoRutas = Number(accessRows?.[0]?.accesoRutas ?? 0) === 1;

    if (sucursalIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    let sql = `
      SELECT
        r.id,
        r.codigo,
        r.nombre,
        r.id_sucursal AS sucursalId,
        r.tipo
      FROM rutas r
      JOIN sucursales s ON r.id_sucursal = s.id
      WHERE r.estado = 1
        AND r.id_sucursal IN (${getPlaceholders(sucursalIds)})
    `;
    const params: (string | number)[] = [...sucursalIds];

    if (sucursalCodigo) {
      sql += `
        AND s.codigo = ?
      `;
      params.push(sucursalCodigo);
    }

    if (!tieneAccesoRutas) {
      sql += `
        AND r.tipo = ?
      `;
      params.push("VENTA_INTERNA");
    }

    sql += `
      ORDER BY r.nombre
    `;

    const [rows]: any = await pool.query(sql, params);

    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error obteniendo rutas.",
      },
      { status: 500 }
    );
  }
}
