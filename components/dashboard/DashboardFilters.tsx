"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


interface Sucursal {
  id: number;
  codigo: string;
  nombre: string;
}

interface Ruta {
  id: number;
  codigo: string;
  nombre: string;
  sucursalId: number;
}

interface Props {
  onFilter: (
    inicio: string,
    fin: string,
    sucursal: string,
    ruta: string
  ) => void;
}

export default function DashboardFilters({
  onFilter,
}: Props) {
  const router = useRouter();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);

  const hoy = new Date();

  const primerDiaMes = new Date(
    hoy.getFullYear(),
    hoy.getMonth(),
    1
  );

  const [inicio, setInicio] = useState(
    primerDiaMes.toISOString().split("T")[0]
  );

  const [fin, setFin] = useState(
    hoy.toISOString().split("T")[0]
  );

  const [sucursal, setSucursal] = useState("");
  const [ruta, setRuta] = useState("");

  const cargarSucursales = useCallback(async () => {
    const response = await fetch("/api/sucursales");
    const result = await response.json();

    if (response.status === 401) {
      router.replace("/login");
      router.refresh();
      return;
    }

    if (response.ok && result.success) {
      setSucursales(result.data);
    }
  }, [router]);

  const cargarRutas = useCallback(async (sucursalCodigo = "") => {
    let url = "/api/rutas";
    if (sucursalCodigo) {
      url += `?codigoSucursal=${encodeURIComponent(sucursalCodigo)}`;
    }

    const response = await fetch(url);
    const result = await response.json();

    if (response.status === 401) {
      router.replace("/login");
      router.refresh();
      return;
    }

    if (response.ok && result.success) {
      setRutas(result.data);
    }
  }, [router]);

  useEffect(() => {
    cargarSucursales();
    cargarRutas();
  }, [cargarRutas, cargarSucursales]);

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div>
          <label className="block mb-1 text-sm">
            Fecha Inicio
          </label>

          <input
            type="date"
            value={inicio}
            onChange={(e) =>
              setInicio(e.target.value)
            }
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">
            Fecha Fin
          </label>

          <input
            type="date"
            value={fin}
            onChange={(e) =>
              setFin(e.target.value)
            }
            className="w-full border rounded-lg p-2"
          />
        </div>

        <div>
          <label className="block mb-1 text-sm">
            Sucursal
          </label>

          <select
            value={sucursal}
            onChange={(e) => {
              const newSucursal = e.target.value;
              setSucursal(newSucursal);
              setRuta("");
              cargarRutas(newSucursal);
            }}
            className="w-full border rounded-lg p-2"
          >
            <option value="">
              Todas las sucursales
            </option>

            {sucursales.map((s) => (
              <option
                key={s.id}
                value={s.codigo}
              >
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm">
            Ruta
          </label>

          <select
            value={ruta}
            onChange={(e) => setRuta(e.target.value)}
            className="w-full border rounded-lg p-2"
          >
            <option value="">
              Todas las rutas
            </option>

            {rutas.map((r) => (
              <option key={r.id} value={r.codigo}>
                {r.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-1">
          <button
            onClick={() =>
              onFilter(
                inicio,
                fin,
                sucursal,
                ruta
              )
            }
            className="
              w-full
              bg-[#F1C380]
              text-[#333333]
              font-semibold
              rounded-lg
              p-2
            "
          >
            Consultar
          </button>
        </div>

      </div>
    </div>
  );
}
