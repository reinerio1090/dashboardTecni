import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/lib/db";
import { verifyAuthToken } from "@/lib/auth";
import { getPlaceholders, getUserSucursalIds } from "@/lib/access";

interface CuentaPorCobrarRow extends RowDataPacket {
  id: number;
  documentoNumero: string;
  fechaVence: string;
  fechaEmision: string | null;
  ruta: string | null;
  rutaNombre: string | null;
  sucursalCodigo: string;
  codigoVendedor: string | null;
  vendedor: string | null;
  codigoCliente: string | null;
  cliente: string | null;
  ventaTotal: number | string | null;
  saldoCartera: number | string | null;
  diasVence: number | string | null;
}

function parseListParam(value: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function emptyKpis() {
  return {
    ventaTotal: 0,
    ventaInterna: 0,
    ventaExterna: 0,
    cantidadFacturas: 0,
    cobrosRealizados: 0,
    carteraVencida: 0,
    ventasPorUsuario: [],
    ventasPorSucursalTermino: [],
    ventasPorSucursal: [],
    ventasPorRuta: [],
    cuentasPorCobrar: [],
  };
}

function routeCodeToBodega(code: string) {
  return code.replace(/^(R|SUC)_?/i, "B_");
}

function formatSqlParam(value: string | number) {
  if (typeof value === "number") {
    return String(value);
  }

  return `'${value.replace(/'/g, "''")}'`;
}

function buildDebugSql(sql: string, params: (string | number)[]) {
  let paramIndex = 0;

  return sql.replace(/\?/g, () => {
    const value = params[paramIndex];
    paramIndex += 1;

    return value === undefined ? "?" : formatSqlParam(value);
  });
}

function intersectStrings(values: string[], allowedValues: string[]) {
  const allowed = new Set(allowedValues);

  return values.filter((value) => allowed.has(value));
}

function buildRouteFilter(
  externalRoutes: string[],
  internalBodegas: string[],
  columnPrefix = "f"
) {
  const clauses: string[] = [];

  if (externalRoutes.length > 0) {
    clauses.push(
      `${columnPrefix}.ruta_documento COLLATE utf8mb4_general_ci IN (${getPlaceholders(externalRoutes)})`
    );
  }

  if (internalBodegas.length > 0) {
    clauses.push(`
      (
        ${columnPrefix}.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(internalBodegas)})
        AND NOT EXISTS (
          SELECT 1
          FROM vendedores vendedor_excluido
          WHERE vendedor_excluido.codigo = ${columnPrefix}.codigo_vend
        )
      )
    `);
  }

  return clauses.length > 0 ? `AND (${clauses.join(" OR ")})` : "";
}

function buildInternalSalesFilter(columnPrefix = "f") {
  return `
    AND NOT EXISTS (
      SELECT 1
      FROM vendedores vendedor_excluido
      WHERE vendedor_excluido.codigo COLLATE utf8mb4_general_ci =
            ${columnPrefix}.codigo_vend COLLATE utf8mb4_general_ci
    )
  `;
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

    const fechaInicio = searchParams.get("inicio");
    const fechaFin = searchParams.get("fin");
    const sucursales = searchParams.get("sucursales");
    const rutas = searchParams.get("rutas");
    const debug = searchParams.get("debug") === "1";
    const listaSucursales = parseListParam(sucursales);
    const listaRutas = parseListParam(rutas);
    const debugInfo: Record<string, unknown> = {};

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar fecha inicio y fecha fin",
        },
        { status: 400 }
      );
    }

    const sucursalIds = await getUserSucursalIds(session);
    if (sucursalIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: emptyKpis(),
      });
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

    const [sucursalesPermitidasRows]: any = await pool.query(
      `
      SELECT codigo
      FROM sucursales
      WHERE estado = 1
        AND id IN (${getPlaceholders(sucursalIds)})
      `,
      sucursalIds
    );

    const sucursalesPermitidas = (sucursalesPermitidasRows || [])
      .map((row: { codigo: string }) => row.codigo)
      .filter(Boolean);

    if (sucursalesPermitidas.length === 0) {
      return NextResponse.json({
        success: true,
        data: emptyKpis(),
      });
    }

    let rutasExternasSeleccionadas: string[] = [];
    let bodegasInternasSeleccionadas: string[] = [];
    let sucursalesDeRutasSeleccionadas: string[] = [];
    let rutasSeleccionadasValidas: string[] = [];

    if (listaRutas.length > 0) {
      const [rutasRows]: any = await pool.query(
        `
        SELECT r.codigo, r.tipo, s.codigo AS sucursalCodigo
        FROM rutas r
        JOIN sucursales s ON s.id = r.id_sucursal
        WHERE r.estado = 1
          AND r.codigo COLLATE utf8mb4_general_ci IN (${getPlaceholders(listaRutas)})
          AND r.id_sucursal IN (${getPlaceholders(sucursalIds)})
          ${tieneAccesoRutas ? "" : "AND r.tipo = 'VENTA_INTERNA'"}
        `,
        [...listaRutas, ...sucursalIds]
      );

      rutasSeleccionadasValidas = (rutasRows || [])
        .map((row: { codigo: string }) => row.codigo)
        .filter(Boolean);

      rutasExternasSeleccionadas = (rutasRows || [])
        .filter((row: { tipo: string }) => row.tipo === "RUTA_EXTERNA")
        .map((row: { codigo: string }) => row.codigo);

      bodegasInternasSeleccionadas = (rutasRows || [])
        .filter((row: { tipo: string }) => row.tipo === "VENTA_INTERNA")
        .map((row: { codigo: string }) => routeCodeToBodega(row.codigo));

      const sucursalesDeRutas = (rutasRows || [])
        .map((row: { sucursalCodigo: string }) => row.sucursalCodigo)
        .filter(Boolean);

      sucursalesDeRutasSeleccionadas = Array.from(
        new Set<string>(sucursalesDeRutas)
      );

      if (
        rutasExternasSeleccionadas.length === 0 &&
        bodegasInternasSeleccionadas.length === 0
      ) {
        return NextResponse.json({
          success: true,
          data: emptyKpis(),
        });
      }
    }

    let whereFacturas = `
      WHERE fecha_factura BETWEEN ? AND ?
        AND bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(sucursalesPermitidas)})
    `;

    const paramsFacturas: (string | number)[] = [
      fechaInicio,
      fechaFin,
      ...sucursalesPermitidas,
    ];

    if (listaSucursales.length > 0) {
      whereFacturas += `
        AND bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(listaSucursales)})
      `;

      paramsFacturas.push(...listaSucursales);
    }

    if (listaRutas.length > 0) {
      whereFacturas += buildRouteFilter(
        rutasExternasSeleccionadas,
        bodegasInternasSeleccionadas
      );

      paramsFacturas.push(
        ...rutasExternasSeleccionadas,
        ...bodegasInternasSeleccionadas
      );
    } else if (!tieneAccesoRutas) {
      whereFacturas += buildInternalSalesFilter();
    }

    const ventaInternaCase =
      bodegasInternasSeleccionadas.length > 0
        ? `
          CASE
            WHEN v.tipo = 'INTERNO' THEN f.precio_total
            WHEN f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(bodegasInternasSeleccionadas)})
              AND NOT EXISTS (
                SELECT 1
                FROM vendedores vendedor_excluido
                WHERE vendedor_excluido.codigo = f.codigo_vend
              )
            THEN f.precio_total
            ELSE 0
          END
        `
        : "CASE WHEN v.tipo = 'INTERNO' THEN f.precio_total ELSE 0 END";

    const paramsVentaInternaCase = bodegasInternasSeleccionadas;

    // ===========================
    // VENTAS
    // ===========================

    const [ventasRows]: any = await pool.query(
      `
      SELECT
          COALESCE(SUM(f.precio_total),0) AS ventaTotal,
          COALESCE(SUM(${ventaInternaCase}),0) AS ventaInterna,
          COALESCE(SUM(CASE WHEN v.tipo = 'EXTERNO' THEN f.precio_total ELSE 0 END),0) AS ventaExterna,
          COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
      FROM facturas f
      LEFT JOIN vendedores v ON v.codigo = f.codigo_vend
      ${whereFacturas}
      `,
      [...paramsVentaInternaCase, ...paramsFacturas]
    );

    const [ventasSucursalRows]: any = await pool.query(
      `
      SELECT
        COALESCE(s.id, 0) AS sucursalId,
        COALESCE(s.codigo, f.bodega) AS sucursalCodigo,
        COALESCE(s.nombre, f.bodega) AS sucursalNombre,
        COALESCE(SUM(f.precio_total),0) AS ventaTotal,
        COALESCE(SUM(${ventaInternaCase}),0) AS ventaInterna,
        COALESCE(SUM(CASE WHEN v.tipo = 'EXTERNO' THEN f.precio_total ELSE 0 END),0) AS ventaExterna
      FROM facturas f
      LEFT JOIN vendedores v ON v.codigo = f.codigo_vend
      LEFT JOIN sucursales s ON s.codigo COLLATE utf8mb4_general_ci = f.bodega COLLATE utf8mb4_general_ci
      ${whereFacturas}
      GROUP BY sucursalId, sucursalCodigo, sucursalNombre
      ORDER BY ventaTotal DESC
      `,
      [...paramsVentaInternaCase, ...paramsFacturas]
    );

    const [ventasRutaRows]: any = await pool.query(
      `
      SELECT
        COALESCE(f.ruta_documento, 'SIN RUTA') AS rutaDocumento,
        COALESCE(SUM(f.precio_total),0) AS ventaTotal,
        COALESCE(SUM(${ventaInternaCase}),0) AS ventaInterna,
        COALESCE(SUM(CASE WHEN v.tipo = 'EXTERNO' THEN f.precio_total ELSE 0 END),0) AS ventaExterna
      FROM facturas f
      LEFT JOIN vendedores v ON v.codigo = f.codigo_vend
      ${whereFacturas}
      GROUP BY f.ruta_documento
      ORDER BY ventaTotal DESC
      `,
      [...paramsVentaInternaCase, ...paramsFacturas]
    );

    // ===========================
    // COBROS
    // ===========================

    const [cobrosRows]: any = await pool.query(
      `
      SELECT
          COALESCE(
              SUM(valor_cobrado),
              0
          ) AS cobrosRealizados

      FROM pagos_historial

      WHERE fecha_cobranza
      BETWEEN ? AND ?
        AND EXISTS (
          SELECT 1
          FROM facturas f
          WHERE f.numero_factura = pagos_historial.documento
            AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(sucursalesPermitidas)})
            ${
              listaSucursales.length > 0
                ? `AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(listaSucursales)})`
                : ""
            }
            ${
              listaRutas.length > 0
                ? buildRouteFilter(
                    rutasExternasSeleccionadas,
                    bodegasInternasSeleccionadas
                  )
                : ""
            }
            ${
              !tieneAccesoRutas && listaRutas.length === 0
                ? buildInternalSalesFilter()
                : ""
            }
        )
      `,
      [
        fechaInicio,
        fechaFin,
        ...sucursalesPermitidas,
        ...listaSucursales,
        ...rutasExternasSeleccionadas,
        ...bodegasInternasSeleccionadas,
      ]
    );

    // ===========================
    // VENTAS POR USUARIO
    // ===========================

    let ventasUsuariosSql = "";
    let paramsVentasUsuarios: (string | number)[] = [];
    let bodegasVentasUsuarioLog: string[] = [];
    let ventasUsuariosRows: any[] = [];
    let ventasSucursalTerminoSql = "";
    let paramsVentasSucursalTermino: (string | number)[] = [];
    let ventasSucursalTerminoRows: any[] = [];
    const seleccionoRutaExterna = rutasExternasSeleccionadas.length > 0;
    const soloVentaInternaPorPermiso = !tieneAccesoRutas && listaRutas.length === 0;
    const seleccionoVentaInterna =
      listaRutas.length > 0 &&
      bodegasInternasSeleccionadas.length > 0 &&
      rutasExternasSeleccionadas.length === 0;
    const modoVentasUsuario = seleccionoRutaExterna
      ? "ruta"
      : seleccionoVentaInterna || soloVentaInternaPorPermiso
      ? "sucursal"
      : "todos";

    if (modoVentasUsuario === "ruta") {
      const bodegasDeRutaPermitidas = intersectStrings(
        sucursalesDeRutasSeleccionadas,
        sucursalesPermitidas
      );
      const bodegasVentasUsuario =
        listaSucursales.length > 0
          ? intersectStrings(bodegasDeRutaPermitidas, listaSucursales)
          : bodegasDeRutaPermitidas;
      bodegasVentasUsuarioLog = bodegasVentasUsuario;

      if (bodegasVentasUsuario.length > 0) {
        ventasUsuariosSql = `
        SELECT
          v.codigo AS codigoVendedor,
          COALESCE(v.nombre, f.nombre_vend) AS nombreVendedor,
          f.bodega AS sucursalCodigo,
          COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
          COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
        FROM facturas AS f
        INNER JOIN vendedores AS v
          ON f.codigo_vend = v.codigo
        WHERE f.fecha_factura >= ?
          AND f.fecha_factura < DATE_ADD(?, INTERVAL 1 DAY)
          AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(bodegasVentasUsuario)})
        GROUP BY
          v.codigo,
          COALESCE(v.nombre, f.nombre_vend),
          f.bodega
        ORDER BY ventaTotal DESC
      `;

        paramsVentasUsuarios = [
          fechaInicio,
          fechaFin,
          ...bodegasVentasUsuario,
        ];
        ventasSucursalTerminoSql = `
        SELECT
          f.bodega AS sucursalCodigo,
          COALESCE(NULLIF(f.termino_pago, ''), 'SIN TERMINO') AS terminoPago,
          COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
          COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
        FROM facturas AS f
        INNER JOIN vendedores AS v
          ON f.codigo_vend = v.codigo
        WHERE f.fecha_factura >= ?
          AND f.fecha_factura < DATE_ADD(?, INTERVAL 1 DAY)
          AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(bodegasVentasUsuario)})
        GROUP BY
          f.bodega,
          COALESCE(NULLIF(f.termino_pago, ''), 'SIN TERMINO')
        ORDER BY f.bodega, ventaTotal DESC
      `;
        paramsVentasSucursalTermino = [...paramsVentasUsuarios];
      }
    } else if (modoVentasUsuario === "sucursal") {
      const sucursalesSeleccionadasPermitidas =
        bodegasInternasSeleccionadas.length > 0
          ? intersectStrings(bodegasInternasSeleccionadas, sucursalesPermitidas)
          : listaSucursales.length > 0
          ? intersectStrings(listaSucursales, sucursalesPermitidas)
          : sucursalesPermitidas;
      bodegasVentasUsuarioLog = sucursalesSeleccionadasPermitidas;

      if (sucursalesSeleccionadasPermitidas.length > 0) {
        ventasUsuariosSql = `
        SELECT
          f.codigo_vend AS codigoVendedor,
          f.nombre_vend AS nombreVendedor,
          f.bodega AS sucursalCodigo,
          COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
          COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
        FROM facturas AS f
        LEFT JOIN vendedores AS v
          ON f.codigo_vend COLLATE utf8mb4_general_ci =
             v.codigo COLLATE utf8mb4_general_ci
        WHERE f.fecha_factura >= ?
          AND f.fecha_factura < DATE_ADD(?, INTERVAL 1 DAY)
          AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(sucursalesSeleccionadasPermitidas)})
          AND v.codigo IS NULL
        GROUP BY
          f.codigo_vend,
          f.nombre_vend,
          f.bodega
        ORDER BY ventaTotal DESC
      `;

        paramsVentasUsuarios = [
          fechaInicio,
          fechaFin,
          ...sucursalesSeleccionadasPermitidas,
        ];
        ventasSucursalTerminoSql = `
        SELECT
          f.bodega AS sucursalCodigo,
          COALESCE(NULLIF(f.termino_pago, ''), 'SIN TERMINO') AS terminoPago,
          COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
          COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
        FROM facturas AS f
        LEFT JOIN vendedores AS v
          ON f.codigo_vend COLLATE utf8mb4_general_ci =
             v.codigo COLLATE utf8mb4_general_ci
        WHERE f.fecha_factura >= ?
          AND f.fecha_factura < DATE_ADD(?, INTERVAL 1 DAY)
          AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(sucursalesSeleccionadasPermitidas)})
          AND v.codigo IS NULL
        GROUP BY
          f.bodega,
          COALESCE(NULLIF(f.termino_pago, ''), 'SIN TERMINO')
        ORDER BY f.bodega, ventaTotal DESC
      `;
        paramsVentasSucursalTermino = [...paramsVentasUsuarios];
      }
    } else {
      const bodegasTodasRutas =
        listaSucursales.length > 0
          ? intersectStrings(listaSucursales, sucursalesPermitidas)
          : sucursalesPermitidas;

      if (bodegasTodasRutas.length > 0) {
        ventasUsuariosSql = `
      SELECT
        f.codigo_vend AS codigoVendedor,
        f.nombre_vend AS nombreVendedor,
        f.bodega AS sucursalCodigo,
        COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
        COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
      FROM facturas AS f
      WHERE f.fecha_factura >= ?
        AND f.fecha_factura < DATE_ADD(?, INTERVAL 1 DAY)
        AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(bodegasTodasRutas)})
      GROUP BY
        f.codigo_vend,
        f.nombre_vend,
        f.bodega
      ORDER BY ventaTotal DESC
      `;

        paramsVentasUsuarios = [
          fechaInicio,
          fechaFin,
          ...bodegasTodasRutas,
        ];
        ventasSucursalTerminoSql = `
      SELECT
        f.bodega AS sucursalCodigo,
        COALESCE(NULLIF(f.termino_pago, ''), 'SIN TERMINO') AS terminoPago,
        COALESCE(SUM(f.precio_total), 0) AS ventaTotal,
        COUNT(DISTINCT f.numero_factura) AS cantidadFacturas
      FROM facturas AS f
      WHERE f.fecha_factura >= ?
        AND f.fecha_factura < DATE_ADD(?, INTERVAL 1 DAY)
        AND f.bodega COLLATE utf8mb4_general_ci IN (${getPlaceholders(bodegasTodasRutas)})
      GROUP BY
        f.bodega,
        COALESCE(NULLIF(f.termino_pago, ''), 'SIN TERMINO')
      ORDER BY f.bodega, ventaTotal DESC
      `;
        paramsVentasSucursalTermino = [...paramsVentasUsuarios];
      }
      bodegasVentasUsuarioLog = bodegasTodasRutas;
    }

    debugInfo.ventasPorUsuario = {
      sql: ventasUsuariosSql,
      params: paramsVentasUsuarios,
      sqlConParametros: ventasUsuariosSql
        ? buildDebugSql(ventasUsuariosSql, paramsVentasUsuarios)
        : "",
      filtros: {
        modoVentasUsuario,
        tieneAccesoRutas,
        sucursalIds,
        sucursalesPermitidas,
        listaSucursales,
        listaRutas,
        rutasExternasSeleccionadas,
        bodegasInternasSeleccionadas,
        sucursalesDeRutasSeleccionadas,
        bodegasVentasUsuario: bodegasVentasUsuarioLog,
      },
    };

    if (ventasUsuariosSql) {
      const [rows]: any = await pool.query(
        ventasUsuariosSql,
        paramsVentasUsuarios
      );
      ventasUsuariosRows = rows;
    }

    if (ventasSucursalTerminoSql) {
      const [rows]: any = await pool.query(
        ventasSucursalTerminoSql,
        paramsVentasSucursalTermino
      );
      ventasSucursalTerminoRows = rows;
    }

    debugInfo.ventasPorSucursalTermino = {
      sql: ventasSucursalTerminoSql,
      params: paramsVentasSucursalTermino,
      sqlConParametros: ventasSucursalTerminoSql
        ? buildDebugSql(ventasSucursalTerminoSql, paramsVentasSucursalTermino)
        : "",
    };

    const codigosVendedores = Array.from(
      new Set(
        ventasUsuariosRows
          .map((venta: { codigoVendedor: string | null }) => venta.codigoVendedor)
          .filter((codigo): codigo is string => Boolean(codigo))
      )
    );

    if (codigosVendedores.length > 0) {
      const metasUsuariosSql = `
        SELECT
          u.cod_usuario AS codigoVendedor,
          m.meta_mensual AS metaMensual
        FROM usuarios u
        JOIN usuarios_metas_vigencias m
          ON m.id_user = u.id_user
        WHERE u.cod_usuario COLLATE utf8mb4_general_ci IN (${getPlaceholders(codigosVendedores)})
          AND m.estado = 1
          AND m.fecha_inicio <= ?
          AND (m.fecha_fin IS NULL OR m.fecha_fin >= ?)
          AND NOT EXISTS (
            SELECT 1
            FROM usuarios_metas_vigencias m2
            WHERE m2.id_user = m.id_user
              AND m2.estado = 1
              AND m2.fecha_inicio <= ?
              AND (m2.fecha_fin IS NULL OR m2.fecha_fin >= ?)
              AND (
                m2.fecha_inicio > m.fecha_inicio
                OR (m2.fecha_inicio = m.fecha_inicio AND m2.id > m.id)
              )
          )
      `;
      const paramsMetasUsuarios: (string | number)[] = [
        ...codigosVendedores,
        fechaFin,
        fechaInicio,
        fechaFin,
        fechaInicio,
      ];
      const [metasUsuariosRows]: any = await pool.query(
        metasUsuariosSql,
        paramsMetasUsuarios
      );
      const metasPorVendedor = new Map<string, number>(
        (metasUsuariosRows || []).map(
          (meta: { codigoVendedor: string; metaMensual: number | string | null }) => [
            meta.codigoVendedor,
            Number(meta.metaMensual ?? 0),
          ]
        )
      );

      ventasUsuariosRows = ventasUsuariosRows.map(
        (venta: {
          codigoVendedor: string;
          ventaTotal: number | string | null;
        }) => {
          const metaMensual = metasPorVendedor.get(venta.codigoVendedor) ?? 0;
          const ventaTotal = Number(venta.ventaTotal ?? 0);

          return {
            ...venta,
            metaMensual,
            porcentajeCumplimiento:
              metaMensual > 0 ? (ventaTotal / metaMensual) * 100 : 0,
          };
        }
      );

      debugInfo.metasUsuarios = {
        sql: metasUsuariosSql,
        params: paramsMetasUsuarios,
        sqlConParametros: buildDebugSql(metasUsuariosSql, paramsMetasUsuarios),
      };
    }


    // ===========================
    // CARTERA VENCIDA
    // ===========================

    const joinRutas = `
      LEFT JOIN rutas r ON c.ruta COLLATE utf8mb4_general_ci = r.codigo COLLATE utf8mb4_general_ci
      LEFT JOIN sucursales s ON r.id_sucursal = s.id
    `;
    let rutasCartera: string[] = [];
    let rutasCarteraSql = "";
    let paramsRutasCartera: (string | number)[] = [];

    if (listaRutas.length > 0) {
      rutasCartera = rutasSeleccionadasValidas;
    } else {
      rutasCarteraSql = `
        SELECT r.codigo
        FROM rutas r
        JOIN sucursales s ON s.id = r.id_sucursal
        WHERE r.estado = 1
          AND r.id_sucursal IN (${getPlaceholders(sucursalIds)})
      `;
      paramsRutasCartera = [...sucursalIds];

      if (listaSucursales.length > 0) {
        rutasCarteraSql += `
          AND s.codigo COLLATE utf8mb4_general_ci IN (${getPlaceholders(listaSucursales)})
        `;
        paramsRutasCartera.push(...listaSucursales);
      }

      const [rutasCarteraRows]: any = await pool.query(
        rutasCarteraSql,
        paramsRutasCartera
      );

      rutasCartera = (rutasCarteraRows || [])
        .map((row: { codigo: string }) => row.codigo)
        .filter(Boolean);
    }


    const whereCartera =
      rutasCartera.length > 0
        ? `
          WHERE c.existe_en_excel = 1
            AND c.ruta COLLATE utf8mb4_general_ci IN (${getPlaceholders(rutasCartera)})
        `
        : "";
    const paramsCartera: (string | number)[] = [...rutasCartera];

    let carteraRows: any[] = [{ carteraVencida: 0 }];
    let cuentasPorCobrarRows: CuentaPorCobrarRow[] = [];

    const carteraSql = whereCartera
      ? `
      SELECT
          COALESCE(
              SUM(c.saldo_cartera),
              0
          ) AS carteraVencida
      FROM cuentas_por_cobrar c
      ${joinRutas}
      ${whereCartera}
        AND DATEDIFF(CURDATE(), c.fecha_vence) > 0
      `
      : "";

    const cuentasPorCobrarSql = whereCartera
      ? `
      SELECT
        c.id,
        c.documento_numero AS documentoNumero,
        c.fecha_vence AS fechaVence,
        c.fecha_emision AS fechaEmision,
        c.ruta,
        COALESCE(r.nombre, c.ruta) AS rutaNombre,
        COALESCE(s.codigo, '') AS sucursalCodigo,
        c.codigo_vendedor AS codigoVendedor,
        c.vendedor,
        c.codigo_cliente AS codigoCliente,
        c.cliente,
        c.venta_total AS ventaTotal,
        c.saldo_cartera AS saldoCartera,
        DATEDIFF(CURDATE(), c.fecha_vence) AS diasVence
      FROM cuentas_por_cobrar c
      ${joinRutas}
      ${whereCartera}
      ORDER BY diasVence DESC, c.saldo_cartera DESC
      `
      : "";

    if (rutasCartera.length === 0) {
      console.warn("[dashboard/kpis] Cuentas por cobrar sin rutas validas:", {
        listaSucursales,
        listaRutas,
        sucursalIds,
        rutasSeleccionadasValidas,
      });
    }

    if (rutasCartera.length > 0) {
      const [carteraResult]: any = await pool.query(
        carteraSql,
        paramsCartera
      );
      carteraRows = carteraResult;

      const [cuentasResult] = await pool.query<CuentaPorCobrarRow[]>(
        cuentasPorCobrarSql,
        paramsCartera
      );
      cuentasPorCobrarRows = cuentasResult;
    }


    debugInfo.cuentasPorCobrar = {
      rutas: {
        sql: rutasCarteraSql,
        params: paramsRutasCartera,
        sqlConParametros: rutasCarteraSql
          ? buildDebugSql(rutasCarteraSql, paramsRutasCartera)
          : "",
        rutasCartera,
      },
      carteraVencida: {
        sql: carteraSql,
        params: paramsCartera,
        sqlConParametros: carteraSql
          ? buildDebugSql(carteraSql, paramsCartera)
          : "",
      },
      listado: {
        sql: cuentasPorCobrarSql,
        params: paramsCartera,
        sqlConParametros: cuentasPorCobrarSql
          ? buildDebugSql(cuentasPorCobrarSql, paramsCartera)
          : "",
        filtros: {
          sucursalIds,
          listaSucursales,
          listaRutas,
          rutasExternasSeleccionadas,
          bodegasInternasSeleccionadas,
          rutasCartera,
        },
      },
    };


    const ventaTotalUsuarios = ventasUsuariosRows.reduce(
      (total, venta: { ventaTotal: number | string | null }) =>
        total + Number(venta.ventaTotal ?? 0),
      0
    );
    const cantidadFacturasUsuarios = ventasUsuariosRows.reduce(
      (total, venta: { cantidadFacturas: number | string | null }) =>
        total + Number(venta.cantidadFacturas ?? 0),
      0
    );

    return NextResponse.json({
      success: true,

      data: {
        ventaTotal:
          ventaTotalUsuarios,

        ventaInterna:
          Number(ventasRows[0]?.ventaInterna ?? 0),

        ventaExterna:
          Number(ventasRows[0]?.ventaExterna ?? 0),

        cantidadFacturas:
          cantidadFacturasUsuarios,

        cobrosRealizados:
          Number(
            cobrosRows[0]?.cobrosRealizados ?? 0
          ),

        carteraVencida:
          Number(
            carteraRows[0]?.carteraVencida ?? 0
          ),

        ventasPorUsuario: ventasUsuariosRows,
        ventasPorSucursalTermino: ventasSucursalTerminoRows,
        ventasPorSucursal: ventasSucursalRows,
        ventasPorRuta: ventasRutaRows,
        cuentasPorCobrar: cuentasPorCobrarRows,
      },
      ...(debug ? { debug: debugInfo } : {}),
    });
  } catch (error) {
    const dbError = error as {
      code?: string;
      errno?: number;
      message?: string;
      sql?: string;
      sqlMessage?: string;
      stack?: string;
    };

    console.error("[dashboard/kpis] Error obteniendo KPIs:", {
      code: dbError.code,
      errno: dbError.errno,
      message: dbError.message,
      sqlMessage: dbError.sqlMessage,
      sql: dbError.sql,
      stack: dbError.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Error obteniendo KPIs",
      },
      {
        status: 500,
      }
    );
  }
}
