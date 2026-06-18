import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAdminSession } from "@/lib/auth";

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  return isAdminSession(token);
}

export async function GET(request: NextRequest) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }
  try {
    const [rows]: any = await pool.query(`
      SELECT
        u.id,
        u.username,
        u.nombres AS nombre,
        GROUP_CONCAT(s.codigo ORDER BY s.codigo SEPARATOR ',') AS sucursalesAsignadas,
        GROUP_CONCAT(s.id ORDER BY s.codigo SEPARATOR ',') AS sucursalesAsignadasIds
      FROM dashboard_users u
      LEFT JOIN dashboard_user_sucursales js ON js.id_usuario = u.id
      LEFT JOIN sucursales s ON s.id = js.id_sucursal AND s.estado = 1
      WHERE u.id_rol = 2
      GROUP BY u.id
      ORDER BY u.username
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error obteniendo jefes.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const { jefeId, sucursalId } = await request.json();

    if (!jefeId || !sucursalId) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar id de jefe y id de sucursal.",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `
      INSERT IGNORE INTO dashboard_user_sucursales
      (id_usuario, id_sucursal)
      VALUES (?, ?)
    `,
      [jefeId, sucursalId]
    );

    return NextResponse.json({
      success: true,
      message: "Sucursal asignada al jefe.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error asignando sucursal.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const { jefeId, sucursalId } = await request.json();

    if (!jefeId || !sucursalId) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar id de jefe y id de sucursal.",
        },
        { status: 400 }
      );
    }

    await pool.query(
      `
      DELETE FROM dashboard_user_sucursales
      WHERE id_usuario = ?
        AND id_sucursal = ?
    `,
      [jefeId, sucursalId]
    );

    return NextResponse.json({
      success: true,
      message: "Asignación eliminada.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error eliminando asignación.",
      },
      { status: 500 }
    );
  }
}
