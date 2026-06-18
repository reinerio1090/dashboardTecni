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

        const sucursalIds = await getUserSucursalIds(session);
        if (sucursalIds.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
            });
        }

        const [rows]: any = await pool.query(`
      SELECT
        id,
        codigo,
        nombre
      FROM sucursales
      WHERE estado = 1
        AND id IN (${getPlaceholders(sucursalIds)})
      ORDER BY nombre
    `, sucursalIds);

        return NextResponse.json({
            success: true,
            data: rows,
        });
    }

    catch (error: any) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
                error,
            },
            { status: 500 }
        );
    }
}
