import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { getPlaceholders, getUserSucursalIds } from "@/lib/access";

interface MetaSucursalRow extends RowDataPacket {
  sucursalId: number;
  sucursalCodigo: string;
  sucursalNombre: string;
  ventaTotalGeneral: number | string | null;
  ventaInterna: number | string | null;
  ventaExterna: number | string | null;
  cantidadFacturasGeneral: number | string | null;
  cantidadFacturasInterna: number | string | null;
  cantidadFacturasExterna: number | string | null;
  metaMensualInterna: number | string | null;
  metaMensualExterna: number | string | null;
}

type TipoVentas = "todas" | "internas" | "externas";

function parseMonth(value: string | null) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || "");

  if (!match) {
    return null;
  }

  const anio = Number(match[1]);
  const mes = Number(match[2]);

  if (!Number.isInteger(anio) || !Number.isInteger(mes) || mes < 1 || mes > 12) {
    return null;
  }

  const inicio = `${anio}-${String(mes).padStart(2, "0")}-01`;

  return { anio, mes, inicio };
}

function countBusinessDays(anio: number, mes: number) {
  const date = new Date(Date.UTC(anio, mes - 1, 1));
  let total = 0;

  while (date.getUTCMonth() === mes - 1) {
    if (date.getUTCDay() !== 0) {
      total += 1;
    }

    date.setUTCDate(date.getUTCDate() + 1);
  }

  return total;
}

function parseTipoVentas(value: string | null): TipoVentas {
  if (value === "todas" || value === "externas") {
    return value;
  }

  return "internas";
}

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
    const parsed = parseMonth(searchParams.get("mes"));

    if (!parsed) {
      return NextResponse.json(
        { success: false, message: "Debe enviar mes en formato YYYY-MM." },
        { status: 400 }
      );
    }

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
    const tipoSolicitado = parseTipoVentas(searchParams.get("tipoVentas"));
    const tipoVentas: TipoVentas = tieneAccesoRutas ? tipoSolicitado : "internas";

    const sucursalIds = await getUserSucursalIds(session);

    if (sucursalIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          mes: searchParams.get("mes"),
          diasLaborables: countBusinessDays(parsed.anio, parsed.mes),
          sucursales: [],
        },
      });
    }

    const sql = `
      SELECT
        s.id AS sucursalId,
        s.codigo AS sucursalCodigo,
        s.nombre AS sucursalNombre,
        COALESCE(v.ventaTotalGeneral, 0) AS ventaTotalGeneral,
        COALESCE(v.ventaInterna, 0) AS ventaInterna,
        COALESCE(v.ventaExterna, 0) AS ventaExterna,
        COALESCE(v.cantidadFacturasGeneral, 0) AS cantidadFacturasGeneral,
        COALESCE(v.cantidadFacturasInterna, 0) AS cantidadFacturasInterna,
        COALESCE(v.cantidadFacturasExterna, 0) AS cantidadFacturasExterna,
        COALESCE(m.metaMensualInterna, 0) AS metaMensualInterna,
        COALESCE(m.metaMensualExterna, 0) AS metaMensualExterna
      FROM sucursales s
      LEFT JOIN (
        SELECT
          f.bodega AS sucursalCodigo,
          COALESCE(SUM(f.precio_total), 0) AS ventaTotalGeneral,
          COALESCE(SUM(CASE WHEN vendedor_excluido.codigo IS NULL THEN f.precio_total ELSE 0 END), 0) AS ventaInterna,
          COALESCE(SUM(CASE WHEN vendedor_excluido.codigo IS NOT NULL THEN f.precio_total ELSE 0 END), 0) AS ventaExterna,
          COUNT(DISTINCT f.numero_factura) AS cantidadFacturasGeneral,
          COUNT(DISTINCT CASE WHEN vendedor_excluido.codigo IS NULL THEN f.numero_factura END) AS cantidadFacturasInterna,
          COUNT(DISTINCT CASE WHEN vendedor_excluido.codigo IS NOT NULL THEN f.numero_factura END) AS cantidadFacturasExterna
        FROM facturas f
        LEFT JOIN vendedores vendedor_excluido
          ON f.codigo_vend =
             vendedor_excluido.codigo 
        WHERE f.fecha_factura >= ?
          AND f.fecha_factura < DATE_ADD(?, INTERVAL 1 MONTH)
          AND f.bodega IN (
            SELECT codigo 
            FROM sucursales
            WHERE id IN (${getPlaceholders(sucursalIds)})
          )
        GROUP BY f.bodega
      ) v
        ON v.sucursalCodigo  =
           s.codigo 
      LEFT JOIN (
        SELECT
          smv.id_sucursal,
          smv.meta_mensual AS metaMensualInterna,
          COALESCE(smv.meta_mensual_externa, 0) AS metaMensualExterna
        FROM sucursales_metas_vigencias smv
        WHERE smv.estado = 1
          AND smv.fecha_inicio < DATE_ADD(?, INTERVAL 1 MONTH)
          AND (smv.fecha_fin IS NULL OR smv.fecha_fin >= ?)
          AND NOT EXISTS (
            SELECT 1
            FROM sucursales_metas_vigencias smv2
            WHERE smv2.id_sucursal = smv.id_sucursal
              AND smv2.estado = 1
              AND smv2.fecha_inicio < DATE_ADD(?, INTERVAL 1 MONTH)
              AND (smv2.fecha_fin IS NULL OR smv2.fecha_fin >= ?)
              AND (
                smv2.fecha_inicio > smv.fecha_inicio
                OR (smv2.fecha_inicio = smv.fecha_inicio AND smv2.id > smv.id)
              )
          )
      ) m
        ON m.id_sucursal = s.id
      WHERE s.estado = 1
        AND s.id IN (${getPlaceholders(sucursalIds)})
      ORDER BY s.nombre
    `;
    const params: (string | number)[] = [
      parsed.inicio,
      parsed.inicio,
      ...sucursalIds,
      parsed.inicio,
      parsed.inicio,
      parsed.inicio,
      parsed.inicio,
      ...sucursalIds,
    ];
    const [rows] = await pool.query<MetaSucursalRow[]>(sql, params);
    const diasLaborables = countBusinessDays(parsed.anio, parsed.mes);

    const sucursales = rows.map((row) => {
      const metaMensualInterna = Number(row.metaMensualInterna ?? 0);
      const metaMensualExterna = Number(row.metaMensualExterna ?? 0);
      const valuesByType = {
        todas: {
          ventaTotal: Number(row.ventaTotalGeneral ?? 0),
          cantidadFacturas: Number(row.cantidadFacturasGeneral ?? 0),
          metaMensual: metaMensualInterna + metaMensualExterna,
        },
        internas: {
          ventaTotal: Number(row.ventaInterna ?? 0),
          cantidadFacturas: Number(row.cantidadFacturasInterna ?? 0),
          metaMensual: metaMensualInterna,
        },
        externas: {
          ventaTotal: Number(row.ventaExterna ?? 0),
          cantidadFacturas: Number(row.cantidadFacturasExterna ?? 0),
          metaMensual: metaMensualExterna,
        },
      };
      const selected = valuesByType[tipoVentas];
      const ventaTotal = selected.ventaTotal;
      const metaMensual = selected.metaMensual;

      return {
        sucursalId: row.sucursalId,
        sucursalCodigo: row.sucursalCodigo,
        sucursalNombre: row.sucursalNombre,
        ventaTotal,
        cantidadFacturas: selected.cantidadFacturas,
        metaMensual,
        metaDiaria: diasLaborables > 0 ? metaMensual / diasLaborables : 0,
        cumplimiento: metaMensual > 0 ? (ventaTotal / metaMensual) * 100 : 0,
        faltante: Math.max(metaMensual - ventaTotal, 0),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        mes: `${parsed.anio}-${String(parsed.mes).padStart(2, "0")}`,
        tipoVentas,
        diasLaborables,
        sucursales,
      },
    });
  } catch (error) {
    console.error("[dashboard/metas-sucursales] Error:", error);
    const message =
      error instanceof Error ? error.message : "Error obteniendo metas por sucursal.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
