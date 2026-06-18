"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface MetaVendedor {
  id: number;
  codigoVendedor: string;
  anio: number;
  mes: number;
  metaMensual: number;
  metaDiaria: number;
  observacion: string | null;
  creadoPor: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  codigoSucursal: string | null;
}

export default function ManageMetas() {
  const [metas, setMetas] = useState<MetaVendedor[]>([]);
  const [codigoVendedor, setCodigoVendedor] = useState("");
  const [anio, setAnio] = useState("");
  const [mes, setMes] = useState("");
  const [metaMensual, setMetaMensual] = useState("");
  const [metaDiaria, setMetaDiaria] = useState("");
  const [observacion, setObservacion] = useState("");
  const [codigoSucursal, setCodigoSucursal] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [metaEditando, setMetaEditando] = useState<MetaVendedor | null>(null);

  useEffect(() => {
    cargarMetas();
  }, []);

  async function cargarMetas() {
    setCargando(true);
    const response = await fetch("/api/metas");
    const result = await response.json();

    if (response.ok && result.success) {
      setMetas(result.data);
      setMensaje("");
    } else {
      setMensaje(result.message || "No se pudieron cargar las metas de vendedores.");
    }
    setCargando(false);
  }

  function validarCampos() {
    if (!codigoVendedor.trim() || !anio || !mes || !metaMensual || !metaDiaria) {
      return false;
    }

    const anioNum = Number(anio);
    const mesNum = Number(mes);
    const mensual = Number(metaMensual.replace(",", "."));
    const diaria = Number(metaDiaria.replace(",", "."));

    return (
      Number.isInteger(anioNum) &&
      anioNum > 0 &&
      Number.isInteger(mesNum) &&
      mesNum >= 1 &&
      mesNum <= 12 &&
      !Number.isNaN(mensual) &&
      !Number.isNaN(diaria)
    );
  }

  async function guardarMeta(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");

    if (!validarCampos()) {
      setMensaje("Completa los campos obligatorios y usa valores numéricos válidos.");
      return;
    }

    const payload: Record<string, unknown> = {
      codigoVendedor: codigoVendedor.trim(),
      anio: Number(anio),
      mes: Number(mes),
      metaMensual: Number(metaMensual.replace(",", ".")),
      metaDiaria: Number(metaDiaria.replace(",", ".")),
      observacion: observacion.trim(),
      codigoSucursal: codigoSucursal.trim() || null,
    };

    let method = "POST";

    if (metaEditando) {
      method = "PATCH";
      payload.id = metaEditando.id;
    }

    const response = await fetch("/api/metas", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      limpiarFormulario();
      setMensaje(metaEditando ? "Meta actualizada correctamente." : "Meta creada correctamente.");
      cargarMetas();
    } else {
      setMensaje(result.message || "Error guardando la meta de vendedor.");
    }
  }

  function editarMeta(meta: MetaVendedor) {
    setMetaEditando(meta);
    setCodigoVendedor(meta.codigoVendedor);
    setAnio(String(meta.anio));
    setMes(String(meta.mes));
    setMetaMensual(String(meta.metaMensual));
    setMetaDiaria(String(meta.metaDiaria));
    setObservacion(meta.observacion || "");
    setCodigoSucursal(meta.codigoSucursal || "");
    setMensaje("");
  }

  async function eliminarMeta(id: number) {
    setMensaje("");

    const response = await fetch("/api/metas", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setMensaje("Meta de vendedor eliminada correctamente.");
      cargarMetas();
    } else {
      setMensaje(result.message || "Error eliminando la meta de vendedor.");
    }
  }

  function limpiarFormulario() {
    setMetaEditando(null);
    setCodigoVendedor("");
    setAnio("");
    setMes("");
    setMetaMensual("");
    setMetaDiaria("");
    setObservacion("");
    setCodigoSucursal("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333]">Metas de vendedores</h2>
          <p className="text-gray-600 mt-1">
            Revisa y administra las metas comerciales por vendedor y sucursal.
          </p>
        </div>

        {mensaje ? (
          <div className="mb-4 rounded-xl border border-[#F1C380] bg-[#FFF5DE] p-4 text-sm text-[#333333]">
            {mensaje}
          </div>
        ) : null}

        {cargando ? (
          <div className="rounded-xl bg-gray-50 p-6 text-gray-600">Cargando metas...</div>
        ) : metas.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-6 text-gray-600">
            No hay metas de vendedores registradas.
          </div>
        ) : (
          <div className="space-y-4">
            {metas.map((meta) => (
              <div key={meta.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-[#333333]">{meta.codigoVendedor} - Sucursal: {meta.codigoSucursal || "N/A"}</p>
                    <p className="text-sm text-gray-500">Meta mensual: {meta.metaMensual.toLocaleString()} | Meta diaria: {meta.metaDiaria.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Año {meta.anio}, Mes {meta.mes}</p>
                    {meta.observacion ? <p className="text-sm text-gray-500">{meta.observacion}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Creado por {meta.creadoPor}
                    </span>
                    <span className="text-sm text-gray-500">
                      {meta.fechaCreacion}
                    </span>
                    <button
                      type="button"
                      onClick={() => editarMeta(meta)}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-[#333333] hover:bg-gray-50"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminarMeta(meta.id)}
                      className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333]">
            {metaEditando ? "Editar meta de vendedor" : "Crear meta de vendedor"}
          </h2>
          <p className="text-gray-600 mt-1">
            {metaEditando
              ? "Actualiza la meta del vendedor"
              : "Agrega una meta mensual y diaria para un vendedor."}
          </p>
        </div>

        <form onSubmit={guardarMeta} className="space-y-4">
          <Input
            label="Código de vendedor"
            value={codigoVendedor}
            onChange={(event) => setCodigoVendedor(event.target.value)}
            type="text"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Año"
              value={anio}
              onChange={(event) => setAnio(event.target.value)}
              type="number"
              min="2000"
              max="2100"
            />
            <Input
              label="Mes"
              value={mes}
              onChange={(event) => setMes(event.target.value)}
              type="number"
              min="1"
              max="12"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Meta mensual"
              value={metaMensual}
              onChange={(event) => setMetaMensual(event.target.value)}
              type="text"
            />
            <Input
              label="Meta diaria"
              value={metaDiaria}
              onChange={(event) => setMetaDiaria(event.target.value)}
              type="text"
            />
          </div>
          <Input
            label="Código de sucursal"
            value={codigoSucursal}
            onChange={(event) => setCodigoSucursal(event.target.value)}
            type="text"
          />
          <div>
            <label className="block mb-2 text-sm text-gray-700">Observación</label>
            <textarea
              value={observacion}
              onChange={(event) => setObservacion(event.target.value)}
              className="w-full min-h-[120px] resize-none rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F1C380]"
            />
          </div>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Button type="submit">
              {metaEditando ? "Actualizar meta" : "Guardar meta"}
            </Button>
            {metaEditando ? (
              <button
                type="button"
                onClick={limpiarFormulario}
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-[#333333] hover:bg-gray-50"
              >
                Cancelar edición
              </button>
            ) : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
