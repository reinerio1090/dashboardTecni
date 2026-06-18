import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAdminSession, verifyAuthToken } from "@/lib/auth";

function requireAdmin(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  return isAdminSession(token);
}

function requireSession(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  return verifyAuthToken(token);
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
        m.id,
        m.codigo_vendedor AS codigoVendedor,
        m.nombre_vendedor AS nombreVendedor,
        m.id_sucursal AS sucursalId,
        s.codigo AS codigoSucursal,
        s.nombre AS sucursalNombre,
        m.anio,
        m.mes,
        m.meta_mensual AS metaMensual,
        m.meta_diaria AS metaDiaria,
        m.observacion,
        COALESCE(u.username, '') AS creadoPor,
        m.fecha_creacion AS fechaCreacion,
        m.fecha_actualizacion AS fechaActualizacion
      FROM metas_vendedores m
      LEFT JOIN sucursales s ON s.id = m.id_sucursal
      LEFT JOIN dashboard_users u ON u.id = m.creado_por
      ORDER BY m.anio DESC, m.mes DESC, m.codigo_vendedor
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
        message: error.message || "Error obteniendo metas de vendedores.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = requireAdmin(request);
  const user = requireSession(request);
  if (!session || !user) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const {
      codigoVendedor,
      anio,
      mes,
      metaMensual,
      metaDiaria,
      observacion,
      codigoSucursal,
    } = await request.json();

    if (!codigoVendedor || !anio || !mes || !metaMensual || !metaDiaria) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar vendedor, año, mes, meta mensual y meta diaria.",
        },
        { status: 400 }
      );
    }

    const mensual = Number(String(metaMensual).replace(",", "."));
    const diaria = Number(String(metaDiaria).replace(",", "."));

    if (Number.isNaN(mensual) || Number.isNaN(diaria)) {
      return NextResponse.json(
        {
          success: false,
          message: "Las metas deben ser valores numéricos válidos.",
        },
        { status: 400 }
      );
    }

    const [vendedorRows]: any = await pool.query(
      `
      SELECT codigo, nombre, id_sucursal AS sucursalId
      FROM vendedores
      WHERE codigo = ?
        AND estado = 1
      LIMIT 1
      `,
      [codigoVendedor]
    );

    const vendedor = vendedorRows?.[0];
    if (!vendedor) {
      return NextResponse.json(
        {
          success: false,
          message: "No se encontró un vendedor activo con ese código.",
        },
        { status: 400 }
      );
    }

    let sucursalId = Number(vendedor.sucursalId);
    if (codigoSucursal) {
      const [sucursalRows]: any = await pool.query(
        `
        SELECT id
        FROM sucursales
        WHERE codigo = ?
          AND estado = 1
        LIMIT 1
        `,
        [codigoSucursal]
      );

      if (!sucursalRows?.[0]) {
        return NextResponse.json(
          {
            success: false,
            message: "No se encontró una sucursal activa con ese código.",
          },
          { status: 400 }
        );
      }

      sucursalId = Number(sucursalRows[0].id);
    }

    await pool.query(
      `
      INSERT INTO metas_vendedores
      (codigo_vendedor, nombre_vendedor, id_sucursal, anio, mes, meta_mensual, meta_diaria, observacion, creado_por, fecha_creacion, fecha_actualizacion)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `,
      [
        codigoVendedor,
        vendedor.nombre,
        sucursalId,
        Number(anio),
        Number(mes),
        mensual,
        diaria,
        observacion || null,
        user.id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Meta de vendedor creada correctamente.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error creando la meta de vendedor.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = requireAdmin(request);
  const user = requireSession(request);
  if (!session || !user) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const {
      id,
      codigoVendedor,
      anio,
      mes,
      metaMensual,
      metaDiaria,
      observacion,
      codigoSucursal,
    } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar el id de la meta.",
        },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const params: (string | number)[] = [];

    if (codigoVendedor) {
      updates.push("codigo_vendedor = ?");
      params.push(codigoVendedor);

      const [vendedorRows]: any = await pool.query(
        `
        SELECT nombre, id_sucursal AS sucursalId
        FROM vendedores
        WHERE codigo = ?
          AND estado = 1
        LIMIT 1
        `,
        [codigoVendedor]
      );

      const vendedor = vendedorRows?.[0];
      if (!vendedor) {
        return NextResponse.json(
          {
            success: false,
            message: "No se encontró un vendedor activo con ese código.",
          },
          { status: 400 }
        );
      }

      updates.push("nombre_vendedor = ?");
      params.push(vendedor.nombre);

      if (!codigoSucursal) {
        updates.push("id_sucursal = ?");
        params.push(Number(vendedor.sucursalId));
      }
    }
    if (anio) {
      updates.push("anio = ?");
      params.push(Number(anio));
    }
    if (mes) {
      updates.push("mes = ?");
      params.push(Number(mes));
    }
    if (metaMensual) {
      const mensual = Number(String(metaMensual).replace(",", "."));
      if (Number.isNaN(mensual)) {
        return NextResponse.json(
          {
            success: false,
            message: "La meta mensual debe ser un valor numérico válido.",
          },
          { status: 400 }
        );
      }
      updates.push("meta_mensual = ?");
      params.push(mensual);
    }
    if (metaDiaria) {
      const diaria = Number(String(metaDiaria).replace(",", "."));
      if (Number.isNaN(diaria)) {
        return NextResponse.json(
          {
            success: false,
            message: "La meta diaria debe ser un valor numérico válido.",
          },
          { status: 400 }
        );
      }
      updates.push("meta_diaria = ?");
      params.push(diaria);
    }
    if (observacion !== undefined) {
      updates.push("observacion = ?");
      params.push(observacion || null);
    }
    if (codigoSucursal) {
      const [sucursalRows]: any = await pool.query(
        `
        SELECT id
        FROM sucursales
        WHERE codigo = ?
          AND estado = 1
        LIMIT 1
        `,
        [codigoSucursal]
      );

      if (!sucursalRows?.[0]) {
        return NextResponse.json(
          {
            success: false,
            message: "No se encontró una sucursal activa con ese código.",
          },
          { status: 400 }
        );
      }

      updates.push("id_sucursal = ?");
      params.push(Number(sucursalRows[0].id));
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

    updates.push("fecha_actualizacion = NOW()");
    params.push(id);

    await pool.query(
      `UPDATE metas_vendedores SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    return NextResponse.json({
      success: true,
      message: "Meta de vendedor actualizada correctamente.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error actualizando la meta de vendedor.",
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
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar el id de la meta.",
        },
        { status: 400 }
      );
    }

    await pool.query(`DELETE FROM metas_vendedores WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Meta eliminada correctamente.",
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error eliminando la meta de vendedor.",
      },
      { status: 500 }
    );
  }
}
