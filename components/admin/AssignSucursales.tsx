"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Sucursal {
  id: number;
  codigo: string;
  nombre: string;
}

interface Jefe {
  id: number;
  nombre: string;
  username: string;
  sucursalesAsignadas: string | null;
  sucursalesAsignadasIds?: string | null;
}

export default function AssignSucursales() {
  const [jefes, setJefes] = useState<Jefe[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [jefeId, setJefeId] = useState(0);
  const [sucursalId, setSucursalId] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const [jefesResponse, sucursalesResponse] = await Promise.all([
      fetch("/api/jefes"),
      fetch("/api/sucursales"),
    ]);

    const [jefesResult, sucursalesResult] = await Promise.all([
      jefesResponse.json(),
      sucursalesResponse.json(),
    ]);

    if (jefesResponse.ok && jefesResult.success) {
      setJefes(jefesResult.data);
      if (jefesResult.data.length > 0) {
        setJefeId(jefesResult.data[0].id);
      }
    }

    if (sucursalesResponse.ok && sucursalesResult.success) {
      setSucursales(sucursalesResult.data);
      if (sucursalesResult.data.length > 0) {
        setSucursalId(sucursalesResult.data[0].id);
      }
    }

    if (!jefesResponse.ok || !jefesResult.success || !sucursalesResponse.ok || !sucursalesResult.success) {
      setMensaje("No se pudieron cargar los datos de jefes o sucursales.");
    } else {
      setMensaje("");
    }
    setCargando(false);
  }

  async function asignarSucursal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");

    if (!jefeId || !sucursalId) {
      setMensaje("Selecciona un jefe y una sucursal.");
      return;
    }

    const response = await fetch("/api/jefes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jefeId, sucursalId }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setMensaje("Sucursal asignada correctamente.");
      cargarDatos();
    } else {
      setMensaje(result.message || "Error asignando sucursal.");
    }
  }

  async function retirarAsignacion(jefeId: number, sucursalId: number) {
    const response = await fetch("/api/jefes", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jefeId, sucursalId }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setMensaje("Asignación eliminada.");
      cargarDatos();
    } else {
      setMensaje(result.message || "Error eliminando la asignación.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333]">Asignar sucursales</h2>
          <p className="text-gray-600 mt-1">
            Vincula sucursales a jefes para que puedan supervisar ventas.
          </p>
        </div>

        {mensaje ? (
            <div className="mb-4 rounded-xl border border-[#F1C380] bg-[#FFF5DE] p-4 text-sm text-[#333333]">
            {mensaje}
          </div>
        ) : null}

        <form onSubmit={asignarSucursal} className="space-y-4">
            <div>
            <label className="block mb-2 text-sm text-gray-700">Jefe</label>
            <select
              value={jefeId}
              onChange={(event) => setJefeId(Number(event.target.value))}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F1C380]"
            >
              {jefes.map((jefe) => (
                <option key={jefe.id} value={jefe.id}>
                  {jefe.nombre} — {jefe.username}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm text-gray-700">Sucursal</label>
            <select
                value={sucursalId}
                onChange={(event) => setSucursalId(Number(event.target.value))}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F1C380]"
            >
              {sucursales.map((sucursal) => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.codigo} — {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit">Asignar sucursal</Button>
        </form>
      </Card>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333]">Jefes y sucursales</h2>
          <p className="text-gray-600 mt-1">
            Revisa las sucursales actualmente asignadas a cada jefe.
          </p>
        </div>

        {cargando ? (
          <div className="rounded-xl bg-gray-50 p-6 text-gray-600">Cargando información...</div>
        ) : jefes.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-6 text-gray-600">
            No se encontraron jefes.
          </div>
        ) : (
          <div className="space-y-4">
                {jefes.map((jefe) => (
              <div key={jefe.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#333333]">{jefe.nombre}</p>
                    <p className="text-sm text-gray-500">{jefe.username}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {jefe.sucursalesAsignadas || "Sin sucursales"}
                  </span>
                </div>
                {jefe.sucursalesAsignadas ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(() => {
                      const ids = (jefe.sucursalesAsignadasIds || "").split(",");
                      const codes = (jefe.sucursalesAsignadas || "").split(",");
                      return ids.map((id, idx) => {
                        const codigo = codes[idx] || id;
                        return (
                          <button
                            key={`${jefe.id}-${id}`}
                            type="button"
                            onClick={() => retirarAsignacion(jefe.id, Number(id))}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:bg-red-100"
                          >
                            Eliminar {codigo}
                          </button>
                        );
                      });
                    })()}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
