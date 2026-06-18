import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
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
        id,
        username,
        nombres AS nombre,
        CASE id_rol
          WHEN 1 THEN 'admin'
          WHEN 2 THEN 'jefe'
          ELSE 'vendedor'
        END AS rol,
        estado,
        COALESCE(acceso_rutas, 0) AS accesoRutas
      FROM dashboard_users
      ORDER BY nombres
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
        message: error.message || "Error obteniendo usuarios.",
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
    const { username, nombre, contrasena, rol, estado, accesoRutas } = await request.json();

    if (!username || !nombre || !rol) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Debe enviar usuario, nombre y rol.",
        },
        { status: 400 }
      );
    }

    const passwordHash = contrasena
      ? await bcrypt.hash(contrasena, 10)
      : null;

    await pool.query(
      `
      INSERT INTO dashboard_users
      (username, nombres, password_hash, id_rol, estado, acceso_rutas)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        username,
        nombre,
        passwordHash,
        rol === "admin" ? 1 : rol === "jefe" ? 2 : 3,
        estado ? 1 : 0,
        accesoRutas ? 1 : 0,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Usuario creado correctamente.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error creando usuario.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = requireAdmin(request);
  if (!session) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const { id, username, nombre, contrasena, rol, estado, accesoRutas } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar el id del usuario.",
        },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (username) {
      updates.push("username = ?");
      params.push(username);
    }
    if (nombre) {
      updates.push("nombres = ?");
      params.push(nombre);
    }
    if (rol) {
      updates.push("id_rol = ?");
      params.push(rol === "admin" ? 1 : rol === "jefe" ? 2 : 3);
    }
    if (typeof estado === "number") {
      updates.push("estado = ?");
      params.push(estado);
    }
    if (typeof accesoRutas === "boolean" || typeof accesoRutas === "number") {
      updates.push("acceso_rutas = ?");
      params.push(accesoRutas ? 1 : 0);
    }
    if (contrasena) {
      const passwordHash = await bcrypt.hash(contrasena, 10);
      updates.push("password_hash = ?");
      params.push(passwordHash);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No se recibió ningún campo para actualizar.",
        },
        { status: 400 }
      );
    }

    params.push(id);

    await pool.query(
      `UPDATE dashboard_users SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return NextResponse.json({
      success: true,
      message: "Usuario actualizado correctamente.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error actualizando usuario.",
      },
      { status: 500 }
    );
  }
}
