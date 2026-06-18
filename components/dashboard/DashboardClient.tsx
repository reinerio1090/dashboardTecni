"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import KpiCard from "@/components/dashboard/KpiCard";
import DashboardFilters from "@/components/dashboard/DashboardFilters";

interface DashboardKpis {
  ventaTotal: number;
  //ventaInterna: number;
  //ventaExterna: number;
  cantidadFacturas: number;
  cobrosRealizados: number;
  carteraVencida: number;
  ventasPorUsuario?: VentasUsuario[];
  ventasPorSucursalTermino?: VentaSucursalTermino[];
  cuentasPorCobrar?: CuentaPorCobrar[];
}

interface VentasUsuario {
  codigoVendedor: string;
  nombreVendedor: string;
  sucursalCodigo: string;
  ventaTotal: number;
  cantidadFacturas: number;
  metaMensual?: number;
  porcentajeCumplimiento?: number;
}

interface VentaSucursalTermino {
  sucursalCodigo: string;
  terminoPago: string;
  ventaTotal: number | string | null;
  cantidadFacturas: number | string | null;
}

interface CuentaPorCobrar {
  id: number;
  documentoNumero: string;
  fechaVence: string;
  fechaEmision: string | null;
  ruta: string;
  rutaNombre: string;
  sucursalCodigo: string;
  codigoVendedor: string | null;
  vendedor: string | null;
  codigoCliente: string | null;
  cliente: string | null;
  ventaTotal: number | string | null;
  saldoCartera: number | string | null;
  diasVence: number | string | null;
}

type CuentaSortKey =
  | "documentoNumero"
  | "fechaVence"
  | "ruta"
  | "vendedor"
  | "cliente"
  | "ventaTotal"
  | "saldoCartera"
  | "diasVence";

type SortDirection = "asc" | "desc";

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pieColors = [
  "#2bbd7e",
  "#31a8d8",
  "#f7b544",
  "#ef1b1b",
  "#8a2aa3",
  "#14b8a6",
  "#f97316",
  "#64748b",
  "#84cc16",
  "#ec4899",
];

function formatNumber(value: number | string | null) {
  return currencyFormatter.format(Number(value ?? 0));
}

function formatDate(value: string | null) {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString("es-EC", { timeZone: "UTC" });
}

function getDiasVenceClass(value: number | string | null) {
  const diasVence = Number(value ?? 0);

  if (diasVence >= 0) {
    return "bg-red-100 text-red-700";
  }

  if (diasVence >= -8) {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-green-100 text-green-700";
}

function getCuentaSortValue(cuenta: CuentaPorCobrar, sortKey: CuentaSortKey) {
  if (sortKey === "ventaTotal" || sortKey === "saldoCartera" || sortKey === "diasVence") {
    return Number(cuenta[sortKey] ?? 0);
  }

  if (sortKey === "fechaVence") {
    return new Date(cuenta.fechaVence).getTime();
  }

  return String(cuenta[sortKey] ?? "").toLowerCase();
}

function getCumplimientoClass(value: number) {
  if (value >= 100) {
    return "bg-emerald-500";
  }

  if (value >= 80) {
    return "bg-amber-400";
  }

  return "bg-rose-500";
}

function buildPieGradient(items: { color: string; percentage: number }[]) {
  let current = 0;

  return items
    .map((item) => {
      const start = current;
      const end = current + item.percentage;
      current = end;

      return `${item.color} ${start}% ${end}%`;
    })
    .join(", ");
}

function buildPieLabels(items: { percentage: number }[]) {
  let current = 0;

  return items.map((item) => {
    const middle = current + item.percentage / 2;
    current += item.percentage;
    const angle = (middle / 100) * 360 - 90;
    const radians = (angle * Math.PI) / 180;
    const radius = 34;

    return {
      x: 50 + Math.cos(radians) * radius,
      y: 50 + Math.sin(radians) * radius,
    };
  });
}

function getPiePoint(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: 50 + radius * Math.cos(radians),
    y: 50 + radius * Math.sin(radians),
  };
}

function buildPieSlices(items: { percentage: number }[]) {
  let current = 0;

  return items.map((item) => {
    const startAngle = (current / 100) * 360;
    const endAngle = ((current + item.percentage) / 100) * 360;
    const start = getPiePoint(startAngle, 50);
    const end = getPiePoint(endAngle, 50);
    const largeArcFlag = item.percentage > 50 ? 1 : 0;
    current += item.percentage;

    if (item.percentage >= 99.99) {
      return "M 50 0 A 50 50 0 1 1 49.99 0 A 50 50 0 1 1 50 0";
    }

    return [
      `M 50 50`,
      `L ${start.x} ${start.y}`,
      `A 50 50 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  });
}

export default function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardKpis | null>(null);
  const [ventasPorUsuario, setVentasPorUsuario] = useState<VentasUsuario[]>([]);
  const [ventasPorSucursalTermino, setVentasPorSucursalTermino] = useState<VentaSucursalTermino[]>([]);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState<CuentaPorCobrar[]>([]);
  const [cuentaSortKey, setCuentaSortKey] = useState<CuentaSortKey>("diasVence");
  const [cuentaSortDirection, setCuentaSortDirection] = useState<SortDirection>("desc");
  const [cuentaRutaFiltro, setCuentaRutaFiltro] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [hoveredPieIndex, setHoveredPieIndex] = useState<number | null>(null);

  const rutasCuentasPorCobrar = Array.from(
    new Map(
      cuentasPorCobrar
        .map((cuenta): [string, string] => [
          cuenta.ruta || "",
          cuenta.rutaNombre || cuenta.ruta || "Sin ruta",
        ])
        .filter(([codigo]) => Boolean(codigo))
    )
  )
    .map(([codigo, nombre]) => ({ codigo, nombre }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  const cuentasPorCobrarFiltradas = cuentaRutaFiltro
    ? cuentasPorCobrar.filter((cuenta) => cuenta.ruta === cuentaRutaFiltro)
    : cuentasPorCobrar;
  const cuentasPorCobrarOrdenadas = [...cuentasPorCobrarFiltradas].sort((a, b) => {
    const aValue = getCuentaSortValue(a, cuentaSortKey);
    const bValue = getCuentaSortValue(b, cuentaSortKey);
    const modifier = cuentaSortDirection === "asc" ? 1 : -1;

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * modifier;
    }

    return String(aValue).localeCompare(String(bValue), "es") * modifier;
  });
  const totalVentasGrafico = ventasPorUsuario.reduce(
    (total, venta) => total + Number(venta.ventaTotal ?? 0),
    0
  );
  const ventasPieData = ventasPorUsuario.map((venta, index) => {
    const ventaTotal = Number(venta.ventaTotal ?? 0);

    return {
      ...venta,
      color: pieColors[index % pieColors.length],
      percentage: totalVentasGrafico > 0 ? (ventaTotal / totalVentasGrafico) * 100 : 0,
    };
  });
  const pieGradient = ventasPieData.length
    ? buildPieGradient(ventasPieData)
    : "#e5e7eb 0% 100%";
  const pieLabels = buildPieLabels(ventasPieData);
  const pieSlices = buildPieSlices(ventasPieData);
  const hoveredPie = hoveredPieIndex === null ? null : ventasPieData[hoveredPieIndex];
  const terminosPago = Array.from(
    new Set(ventasPorSucursalTermino.map((venta) => venta.terminoPago || "SIN TERMINO"))
  ).sort((a, b) => a.localeCompare(b, "es"));
  const terminosPagoColor = new Map(
    terminosPago.map((termino, index) => [termino, pieColors[index % pieColors.length]])
  );
  const ventasPorSucursalTerminoChart = Array.from(
    ventasPorSucursalTermino.reduce((map, venta) => {
      const sucursal = venta.sucursalCodigo || "SIN SUCURSAL";
      const termino = venta.terminoPago || "SIN TERMINO";
      const current = map.get(sucursal) || {
        sucursal,
        total: 0,
        terminos: new Map<string, number>(),
      };
      const ventaTotal = Number(venta.ventaTotal ?? 0);

      current.total += ventaTotal;
      current.terminos.set(termino, (current.terminos.get(termino) || 0) + ventaTotal);
      map.set(sucursal, current);

      return map;
    }, new Map<string, { sucursal: string; total: number; terminos: Map<string, number> }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.total - a.total);
  const maxVentaTermino = Math.max(
    ...ventasPorSucursalTerminoChart.flatMap((sucursal) =>
      terminosPago.map((termino) => sucursal.terminos.get(termino) || 0)
    ),
    0
  );

  function ordenarCuentas(sortKey: CuentaSortKey) {
    if (sortKey === cuentaSortKey) {
      setCuentaSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setCuentaSortKey(sortKey);
    setCuentaSortDirection(sortKey === "diasVence" ? "desc" : "asc");
  }

  function sortLabel(sortKey: CuentaSortKey) {
    if (sortKey !== cuentaSortKey) {
      return "";
    }

    return cuentaSortDirection === "asc" ? " ↑" : " ↓";
  }

  function renderSortHeader({
    sortKey,
    children,
    align = "left",
  }: {
    sortKey: CuentaSortKey;
    children: string;
    align?: "left" | "right";
  }) {
    return (
      <th className={`border-b px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
        <button
          type="button"
          onClick={() => ordenarCuentas(sortKey)}
          className={`font-semibold text-[#333333] hover:text-black ${
            align === "right" ? "text-right" : "text-left"
          }`}
        >
          {children}
          {sortLabel(sortKey)}
        </button>
      </th>
    );
  }

  async function cargarKpis(
    fechaInicio: string,
    fechaFin: string,
    sucursalCodigo: string,
    rutaCodigo: string
  ) {
    if (!fechaInicio || !fechaFin) {
      setError("Debe seleccionar fecha de inicio y fecha de fin.");
      return;
    }

    setError("");
    setCargando(true);

    let url = `/api/dashboard/kpis?inicio=${fechaInicio}&fin=${fechaFin}`;
    if (sucursalCodigo) {
      url += `&sucursales=${encodeURIComponent(sucursalCodigo)}`;
    }
    if (rutaCodigo) {
      url += `&rutas=${encodeURIComponent(rutaCodigo)}`;
    }

    try {
      const response = await fetch(url);
      const result = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }

      if (!response.ok || !result.success) {
        setError(result.message || "Error obteniendo KPIs");
        setData(null);
        setVentasPorUsuario([]);
        setVentasPorSucursalTermino([]);
        setCuentasPorCobrar([]);
      } else {
        setData(result.data);
        setVentasPorUsuario(result.data.ventasPorUsuario || []);
        setVentasPorSucursalTermino(result.data.ventasPorSucursalTermino || []);
        setCuentasPorCobrar(result.data.cuentasPorCobrar || []);
        setCuentaRutaFiltro("");
      }
    } catch {
      setError("Error conectando con el servidor.");
      setData(null);
      setVentasPorUsuario([]);
      setVentasPorSucursalTermino([]);
      setCuentasPorCobrar([]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-bold text-[#333333] mb-6">
          Dashboard Comercial
        </h1>

        <div className="grid gap-4">
          <DashboardFilters
            onFilter={(fechaInicio, fechaFin, sucursalCodigo, rutaCodigo) => {
              cargarKpis(fechaInicio, fechaFin, sucursalCodigo, rutaCodigo);
            }}
          />

          {error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700">
              {error}
            </div>
          ) : cargando ? (
            <div className="rounded-xl bg-white shadow p-6 text-gray-600">
              Cargando KPIs...
            </div>
          ) : data ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  titulo="Venta Total"
                  valor={`$${data.ventaTotal.toLocaleString()}`}
                  detalle="Venta total"
                  detalleSecundario={`Facturas ${data.cantidadFacturas}`}
                  icono="▱"
                  tono="ventas"
                />
                {/* <KpiCard titulo="Venta Interna" valor={data.ventaInterna.toLocaleString()} /> */}
                {/* <KpiCard titulo="Venta Externa" valor={data.ventaExterna.toLocaleString()} /> */}
                <KpiCard
                  titulo="Cobros"
                  valor={`$${data.cobrosRealizados.toLocaleString()}`}
                  detalle="Cobros"
                  icono="$"
                  tono="cobros"
                />
                <KpiCard
                  titulo="Cartera Vencida"
                  valor={`$${data.carteraVencida.toLocaleString()}`}
                  detalle="Cartera vencida"
                  icono="↩"
                  tono="cartera"
                />
              </div>

              
              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="text-xl font-semibold text-[#333333] mb-4">Ventas por usuario</h2>
                {ventasPorUsuario.length === 0 ? (
                  <p className="text-gray-600">No hay ventas de usuarios para este filtro.</p>
                ) : (
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-240 text-left text-sm text-gray-700">
                        <thead>
                          <tr>
                            <th className="border-b px-4 py-3 text-right">#</th>
                            <th className="border-b px-4 py-3">Vendedor</th>
                            <th className="border-b px-4 py-3">Sucursal</th>
                            <th className="border-b px-4 py-3">Venta Total</th>
                            <th className="border-b px-4 py-3">Meta</th>
                            <th className="border-b px-4 py-3">Cumplimiento</th>
                            <th className="border-b px-4 py-3">Facturas</th>    
                          </tr>
                        </thead>
                        <tbody>
                          {ventasPorUsuario.map((venta, index) => (
                            <tr key={`${venta.codigoVendedor}-${venta.sucursalCodigo}`}>
                              <td className="border-b px-1 py-1 text-center text-gray-500">{index + 1}</td>
                              <td className="border-b px-1 py-1">{venta.nombreVendedor}</td>
                              <td className="border-b px-1 py-1">{venta.sucursalCodigo}</td>
                              <td className="border-b px-1 py-1 text-center">{venta.ventaTotal.toLocaleString()}</td>
                              <td className="border-b px-1 py-1 text-center">{formatNumber(venta.metaMensual ?? 0)}</td>
                              <td className="border-b px-1 py-1">
                                <div className="flex items-center gap-3">
                                  <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-200">
                                    <div
                                      className={`h-full rounded-full ${getCumplimientoClass(venta.porcentajeCumplimiento ?? 0)}`}
                                      style={{
                                        width: `${Math.min(venta.porcentajeCumplimiento ?? 0, 100)}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="w-14 text-right font-medium">
                                    {(venta.porcentajeCumplimiento ?? 0).toFixed(2)}%
                                  </span>
                                </div>
                              </td>
                              <td className="border-b px-4 py-3">{venta.cantidadFacturas}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <aside className="border-l border-gray-100 pl-0 xl:pl-6">
                      <h3 className="mb-4 text-sm font-semibold text-[#333333]">Participacion de ventas</h3>
                      <div
                        className="relative mx-auto h-56 w-56 rounded-full"
                        style={{ background: `conic-gradient(${pieGradient})` }}
                        onMouseLeave={() => setHoveredPieIndex(null)}
                      >
                        <svg
                          className="absolute inset-0 z-10 h-full w-full rounded-full"
                          viewBox="0 0 100 100"
                          aria-hidden="true"
                        >
                          {ventasPieData.map((venta, index) =>
                            venta.percentage > 0 ? (
                              <path
                                key={`pie-hover-${venta.codigoVendedor}-${venta.sucursalCodigo}`}
                                d={pieSlices[index]}
                                fill="transparent"
                                className="cursor-pointer"
                                style={{ pointerEvents: "all" }}
                                onMouseEnter={() => setHoveredPieIndex(index)}
                              >
                                <title>
                                  {venta.nombreVendedor}: {venta.percentage.toFixed(2)}%
                                </title>
                              </path>
                            ) : null
                          )}
                        </svg>
                        {ventasPieData.map((venta, index) =>
                          venta.percentage >= 4 ? (
                            <span
                              key={`pie-label-${venta.codigoVendedor}-${venta.sucursalCodigo}`}
                              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm"
                              style={{
                                left: `${pieLabels[index].x}%`,
                                top: `${pieLabels[index].y}%`,
                              }}
                            >
                              {venta.percentage.toFixed(1)}%
                            </span>
                          ) : null
                        )}
                        {hoveredPie ? (
                          <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 w-48 -translate-x-1/2 -translate-y-1/2 rounded-md bg-black/85 px-3 py-2 text-center text-xs font-semibold text-white shadow-xl ring-1 ring-white/20">
                            <div className="truncate">{hoveredPie.nombreVendedor}</div>
                            <div>{hoveredPie.percentage.toFixed(2)}%</div>
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-5 max-h-64 space-y-3 overflow-y-auto pr-1">
                        {ventasPieData.map((venta) => (
                          <div key={`pie-${venta.codigoVendedor}-${venta.sucursalCodigo}`} className="grid grid-cols-[12px_minmax(0,1fr)_56px] items-center gap-2 text-xs text-gray-700">
                            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: venta.color }} />
                            <span className="truncate">{venta.nombreVendedor}</span>
                            <span className="text-right font-semibold">{venta.percentage.toFixed(2)}%</span>
                          </div>
                        ))}
                      </div>
                    </aside>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#333333]">
                      Ventas por sucursal y termino de pago
                    </h2>
                    <p className="text-sm text-gray-600">
                      Suma de precio total agrupada por sucursal y termino de pago.
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">
                    {ventasPorSucursalTermino.length} registros
                  </p>
                </div>

                {ventasPorSucursalTermino.length === 0 ? (
                  <p className="text-gray-600">
                    No hay ventas agrupadas por termino de pago para este filtro.
                  </p>
                ) : (
                  <div className="space-y-5">
                    <div className="w-full rounded-lg border border-gray-100 bg-gray-50 p-4 lg:w-1/2">
                      <div className="mb-4 flex flex-wrap gap-3">
                        {terminosPago.map((termino) => (
                          <div key={termino} className="flex items-center gap-2 text-xs text-gray-700">
                            <span
                              className="h-3 w-3 rounded-sm"
                              style={{ backgroundColor: terminosPagoColor.get(termino) }}
                            />
                            <span>{termino}</span>
                          </div>
                        ))}
                      </div>

                      <div className="max-h-96 space-y-4 overflow-y-auto pr-2">
                        {ventasPorSucursalTerminoChart.map((sucursal) => (
                          <div
                            key={sucursal.sucursal}
                            className="grid gap-2 rounded-md bg-white p-3 sm:grid-cols-[150px_1fr]"
                          >
                            <div>
                              <div className="font-semibold text-[#333333]">{sucursal.sucursal}</div>
                              <div className="text-xs text-gray-500">{formatNumber(sucursal.total)}</div>
                            </div>
                            <div className="space-y-2">
                              {terminosPago.map((termino) => {
                                const value = sucursal.terminos.get(termino) || 0;
                                const width =
                                  maxVentaTermino > 0 ? Math.max((value / maxVentaTermino) * 100, 2) : 0;

                                return (
                                  <div
                                    key={`${sucursal.sucursal}-${termino}`}
                                    className="grid grid-cols-[92px_1fr_92px] items-center gap-2 text-xs"
                                  >
                                    <span className="truncate text-gray-600">{termino}</span>
                                    <div className="h-4 overflow-hidden rounded-full bg-gray-200">
                                      <div
                                        className="h-full rounded-full"
                                        style={{
                                          width: `${width}%`,
                                          backgroundColor: terminosPagoColor.get(termino),
                                        }}
                                      />
                                    </div>
                                    <span className="text-right font-semibold text-gray-700">
                                      {formatNumber(value)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-[#333333]">Cuentas por cobrar por ruta</h2>
                    <p className="text-sm text-gray-600">
                      Orden inicial por más días de vencimiento.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="text-sm text-gray-700">
                      Ruta
                      <select
                        value={cuentaRutaFiltro}
                        onChange={(event) => setCuentaRutaFiltro(event.target.value)}
                        className="mt-1 block w-full min-w-64 rounded-lg border border-gray-300 bg-white px-3 py-2"
                      >
                        <option value="">Todas las rutas</option>
                        {rutasCuentasPorCobrar.map((ruta) => (
                          <option key={ruta.codigo} value={ruta.codigo}>
                            {ruta.nombre}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="pb-2 text-sm font-medium text-gray-700">
                      {cuentasPorCobrarOrdenadas.length} de {cuentasPorCobrar.length} registros
                    </p>
                  </div>
                </div>

                {cuentasPorCobrarOrdenadas.length === 0 ? (
                  <p className="text-gray-600">No hay cuentas por cobrar para este filtro.</p>
                ) : (
                  <div className="max-h-120 overflow-auto pr-1">
                    <table className="w-full min-w-300 text-left text-sm text-gray-700">
                      <thead className="sticky top-0 z-10 bg-white">
                        <tr>
                          <th className="border-b px-4 py-3 text-right">#</th>
                          {renderSortHeader({ sortKey: "documentoNumero", children: "Documento" })}
                          {renderSortHeader({ sortKey: "fechaVence", children: "Vence" })}
                          {renderSortHeader({
                            sortKey: "diasVence",
                            children: "Dias vencidos",
                            align: "right",
                          })}
                          {renderSortHeader({ sortKey: "ruta", children: "Ruta" })}
                          {renderSortHeader({ sortKey: "vendedor", children: "Vendedor" })}
                          {renderSortHeader({ sortKey: "cliente", children: "Cliente" })}
                          {renderSortHeader({
                            sortKey: "ventaTotal",
                            children: "Venta total",
                            align: "right",
                          })}
                          {renderSortHeader({
                            sortKey: "saldoCartera",
                            children: "Saldo cartera",
                            align: "right",
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {cuentasPorCobrarOrdenadas.map((cuenta, index) => (
                          <tr key={cuenta.id}>
                            <td className="border-b px-4 py-3 text-right text-gray-500">{index + 1}</td>
                            <td className="border-b px-4 py-3">{cuenta.documentoNumero}</td>
                            <td className="border-b px-4 py-3">{formatDate(cuenta.fechaVence)}</td>
                            <td className="border-b px-4 py-3 text-right">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getDiasVenceClass(cuenta.diasVence)}`}>
                                {Number(cuenta.diasVence ?? 0)}
                              </span>
                            </td>
                            <td className="border-b px-4 py-3">{cuenta.rutaNombre || cuenta.ruta || "N/A"}</td>
                            <td className="border-b px-4 py-3">{cuenta.vendedor || "N/A"}</td>
                            <td className="border-b px-4 py-3">{cuenta.cliente || "N/A"}</td>
                            <td className="border-b px-4 py-3 text-right">{formatNumber(cuenta.ventaTotal)}</td>
                            <td className="border-b px-4 py-3 text-right">{formatNumber(cuenta.saldoCartera)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>


            </>
          ) : (
            <div className="rounded-xl bg-white shadow p-6 text-gray-600">
              Selecciona un rango de fechas y haz clic en Consultar para ver los KPIs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
