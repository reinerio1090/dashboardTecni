"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface MetaSucursal {
  sucursalId: number;
  sucursalCodigo: string;
  sucursalNombre: string;
  ventaTotal: number;
  cantidadFacturas: number;
  metaMensual: number;
  metaDiaria: number;
  cumplimiento: number;
  faltante: number;
}

interface MetasResponse {
  mes: string;
  tipoVentas: TipoVentas;
  diasLaborables: number;
  sucursales: MetaSucursal[];
}

type TipoVentas = "todas" | "internas" | "externas";

interface Props {
  accesoRutas: boolean;
}

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const chartColors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#475569",
];

function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function getCumplimientoColor(value: number) {
  if (value >= 100) {
    return "bg-emerald-500";
  }

  if (value >= 80) {
    return "bg-amber-400";
  }

  return "bg-rose-500";
}

function getShortName(value: string) {
  return value
    .replace(/^Sucursal\s+/i, "")
    .replace(/^B[_\s-]+/i, "")
    .replace(/_/g, " ")
    .trim()
    .slice(0, 13);
}

export default function MetasSucursalesClient({ accesoRutas }: Props) {
  const router = useRouter();
  const [mes, setMes] = useState(getCurrentMonth());
  const [tipoVentas, setTipoVentas] = useState<TipoVentas>("internas");
  const [data, setData] = useState<MetasResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const sucursales = [...(data?.sucursales ?? [])].sort(
    (a, b) => b.cumplimiento - a.cumplimiento
  );
  const totalVentas = sucursales.reduce((total, sucursal) => total + sucursal.ventaTotal, 0);
  const totalMetaMensual = sucursales.reduce(
    (total, sucursal) => total + sucursal.metaMensual,
    0
  );
  const totalFaltante = sucursales.reduce((total, sucursal) => total + sucursal.faltante, 0);
  const totalDiferencia = totalVentas - totalMetaMensual;
  const totalFacturas = sucursales.reduce(
    (total, sucursal) => total + sucursal.cantidadFacturas,
    0
  );
  const totalMetaDiaria =
    data && data.diasLaborables > 0 ? totalMetaMensual / data.diasLaborables : 0;
  const cumplimientoTotal =
    totalMetaMensual > 0 ? (totalVentas / totalMetaMensual) * 100 : 0;
  const chartSegments =
    totalVentas > 0
      ? sucursales.reduce<
          {
            sucursal: MetaSucursal;
            color: string;
            percentage: number;
            labelX: number;
            labelY: number;
          }[]
        >((segments, sucursal, index) => {
          if (sucursal.ventaTotal <= 0) {
            return segments;
          }

          const percentage = (sucursal.ventaTotal / totalVentas) * 100;
          const start = segments.reduce((total, segment) => total + segment.percentage, 0);
          const middleAngle = ((start + percentage / 2) / 100) * 360 - 90;
          const radians = (middleAngle * Math.PI) / 180;
          const radius = percentage >= 12 ? 96 : 118;

          return [
            ...segments,
            {
              sucursal,
              color: chartColors[index % chartColors.length],
              percentage,
              labelX: 160 + Math.cos(radians) * radius,
              labelY: 160 + Math.sin(radians) * radius,
            },
          ];
        }, [])
      : [];
  const legendSegments =
    chartSegments.length > 0
      ? [...chartSegments].sort((a, b) => b.percentage - a.percentage)
      : sucursales.map((sucursal, index) => ({
          sucursal,
          color: chartColors[index % chartColors.length],
          percentage: 0,
        }));
  let chartCursor = 0;
  const chartGradient =
    chartSegments.length > 0
      ? chartSegments
          .map((segment) => {
            const start = chartCursor;
            chartCursor += segment.percentage;
            return `${segment.color} ${start}% ${chartCursor}%`;
          })
          .join(", ")
      : "#e5e7eb 0% 100%";

  async function consultar() {
    if (!mes) {
      setError("Debe seleccionar un mes.");
      return;
    }

    setError("");
    setCargando(true);

    try {
      const response = await fetch(
        `/api/dashboard/metas-sucursales?mes=${encodeURIComponent(
          mes
        )}&tipoVentas=${encodeURIComponent(tipoVentas)}`
      );
      const result = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        router.refresh();
        return;
      }

      if (!response.ok || !result.success) {
        setError(result.message || "No se pudieron obtener las metas.");
        setData(null);
        return;
      }

      setData(result.data);
    } catch {
      setError("Error conectando con el servidor.");
      setData(null);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333]">Metas por sucursal</h1>
            <p className="mt-1 text-sm text-gray-600">
              Compara ventas mensuales contra la meta vigente de cada sucursal permitida.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="text-sm text-gray-700">
              Mes
              <input
                type="month"
                value={mes}
                onChange={(event) => setMes(event.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
              />
            </label>

            <label className="text-sm text-gray-700">
              Tipo de ventas
              <select
                value={tipoVentas}
                onChange={(event) => setTipoVentas(event.target.value as TipoVentas)}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
              >
                {accesoRutas ? <option value="todas">Todas</option> : null}
                <option value="internas">Ventas internas</option>
                {accesoRutas ? <option value="externas">Ventas externas</option> : null}
              </select>
            </label>

            <button
              type="button"
              onClick={consultar}
              className="rounded-lg bg-[#F1C380] px-5 py-2 font-semibold text-[#333333]"
            >
              Consultar
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        {cargando ? (
          <div className="rounded-lg bg-white p-6 text-gray-600 shadow">
            Cargando metas...
          </div>
        ) : data ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-[#333333]">
                  Participacion de ventas
                </h2>
                <span className="text-sm text-gray-600">
                  Total ventas: {formatCurrency(totalVentas)}
                </span>
              </div>

              {sucursales.length === 0 ? (
                <p className="text-gray-600">No hay sucursales permitidas para consultar.</p>
              ) : (
                <div className="grid gap-6 lg:grid-cols-[400px_1fr] lg:items-center">
                  <div className="flex justify-center">
                    <div
                      className="relative h-80 w-80 rounded-full border border-gray-200 shadow-inner"
                      style={{ background: `conic-gradient(${chartGradient})` }}
                    >
                      <div className="absolute inset-20 rounded-full bg-white shadow-sm" />
                      {chartSegments.map((segment) => (
                        <div
                          key={segment.sucursal.sucursalId}
                          className="absolute z-10 w-16 -translate-x-1/2 -translate-y-1/2 rounded bg-black/30 px-1 py-0.5 text-center text-[10px] font-semibold leading-tight text-white shadow-sm"
                          style={{
                            left: `${segment.labelX}px`,
                            top: `${segment.labelY}px`,
                          }}
                          title={`${segment.sucursal.sucursalNombre}: ${segment.percentage.toFixed(
                            2
                          )}%`}
                        >
                          <div className="truncate">{getShortName(segment.sucursal.sucursalNombre)}</div>
                          <div>{segment.percentage.toFixed(1)}%</div>
                        </div>
                      ))}
                      <div className="absolute inset-0 flex items-center justify-center text-center">
                        <div>
                          <div className="text-xs font-semibold uppercase text-gray-500">
                            Ventas
                          </div>
                          <div className="text-lg font-bold text-[#333333]">
                            {formatCurrency(totalVentas)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto pr-2">
                    <div className="grid gap-1 sm:grid-cols-3">
                      {legendSegments.map((segment) => (
                        <div
                          key={segment.sucursal.sucursalId}
                          className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <span
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium text-[#333333]">
                              {segment.sucursal.sucursalNombre}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(segment.sucursal.ventaTotal)}
                            </div>
                          </div>
                          <div className="text-right font-semibold text-gray-700">
                            {segment.percentage.toFixed(2)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-[#333333]">
                  Ventas vs metas
                </h2>
                <span className="text-sm text-gray-600">
                  Dias laborables del mes: {data.diasLaborables}
                </span>
              </div>

              {sucursales.length === 0 ? (
                <p className="text-gray-600">No hay sucursales permitidas para consultar.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[960px] text-left text-sm text-gray-700">
                    <thead>
                      <tr>
                        <th className="border-b px-4 py-1 text-center">#</th>
                        <th className="border-b px-4 py-1">Sucursal</th>
                        <th className="border-b px-4 py-1 text-center">Ventas</th>
                        <th className="border-b px-4 py-1 text-center">Meta mensual</th>
                        <th className="border-b px-4 py-1 text-center">Meta diaria</th>
                        <th className="border-b px-4 py-1">Cumplimiento</th>
                        <th className="border-b px-4 py-1 text-center">Pendientes</th>
                        <th className="border-b px-4 py-1 text-center">Facturas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sucursales.map((sucursal, index) => (
                        <tr key={sucursal.sucursalId}>
                          <td className="border-b px-4 py-3 text-right text-gray-500">
                            {index + 1}
                          </td>
                          <td className="border-b px-4 py-3">
                            <div className="font-medium text-[#333333]">
                              {sucursal.sucursalNombre}
                            </div>
                            <div className="text-xs text-gray-500">{sucursal.sucursalCodigo}</div>
                          </td>
                          <td className="border-b px-4 py-3 text-center">
                            {formatCurrency(sucursal.ventaTotal)}
                          </td>
                          <td className="border-b px-4 py-3 text-center">
                            {formatCurrency(sucursal.metaMensual)}
                          </td>
                          <td className="border-b px-4 py-3 text-center">
                            {formatCurrency(sucursal.metaDiaria)}
                          </td>
                          <td className="border-b px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-2.5 w-36 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className={`h-full rounded-full ${getCumplimientoColor(
                                    sucursal.cumplimiento
                                  )}`}
                                  style={{ width: `${Math.min(sucursal.cumplimiento, 100)}%` }}
                                />
                              </div>
                              <span className=" text-center font-semibold">
                                {sucursal.cumplimiento.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td
                            className={`border-b px-4 py-3 text-center font-medium ${
                              sucursal.ventaTotal >= sucursal.metaMensual && sucursal.metaMensual > 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {sucursal.ventaTotal >= sucursal.metaMensual && sucursal.metaMensual > 0
                              ? `+${formatCurrency(sucursal.ventaTotal - sucursal.metaMensual)}`
                              : formatCurrency(sucursal.faltante)}
                          </td>
                          <td className="border-b px-4 py-3 text-right">
                            {sucursal.cantidadFacturas}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 font-bold text-[#333333]">
                        <td className="border-t px-4 py-3 text-right" colSpan={2}>
                          Total
                        </td>
                        <td className="border-t px-4 py-3 text-right">
                          {formatCurrency(totalVentas)}
                        </td>
                        <td className="border-t px-4 py-3 text-right">
                          {formatCurrency(totalMetaMensual)}
                        </td>
                        <td className="border-t px-4 py-3 text-right">
                          {formatCurrency(totalMetaDiaria)}
                        </td>
                        <td className="border-t px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-36 overflow-hidden rounded-full bg-gray-200">
                              <div
                                className={`h-full rounded-full ${getCumplimientoColor(
                                  cumplimientoTotal
                                )}`}
                                style={{ width: `${Math.min(cumplimientoTotal, 100)}%` }}
                              />
                            </div>
                            <span className="w-16 text-right font-semibold">
                              {cumplimientoTotal.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td
                          className={`border-t px-4 py-3 text-right ${
                            totalDiferencia >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {totalDiferencia >= 0
                            ? `+${formatCurrency(totalDiferencia)}`
                            : formatCurrency(totalFaltante)}
                        </td>
                        <td className="border-t px-4 py-3 text-right">{totalFacturas}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-white p-6 text-gray-600 shadow">
            Selecciona un mes y consulta las metas por sucursal.
          </div>
        )}
      </div>
    </div>
  );
}
