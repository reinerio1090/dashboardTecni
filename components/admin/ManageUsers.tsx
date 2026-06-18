"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Usuario {
  id: number;
  username: string;
  nombre: string;
  rol: string;
  estado: number;
  accesoRutas: number;
}

const roles = [
  { value: "admin", label: "Administrador" },
  { value: "jefe", label: "Jefe" },
  { value: "vendedor", label: "Vendedor" },
];

export default function ManageUsers() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("vendedor");
  const [accesoRutas, setAccesoRutas] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    setCargando(true);
    const response = await fetch("/api/usuarios");
    const result = await response.json();
    if (response.ok && result.success) {
      setUsuarios(result.data);
      setMensaje("");
    } else {
      setMensaje(result.message || "No se pudieron cargar los usuarios.");
    }
    setCargando(false);
  }


  async function guardarUsuario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");

    if (!username.trim() || !nombre.trim() || !rol) {
      setMensaje("Completa usuario, nombre y rol.");
      return;
    }

    

    if (!usuarioEditando && !contrasena.trim()) {
      setMensaje("Completa la contraseña para crear un usuario.");
      return;
    }

    const payload: Record<string, unknown> = {
      username: username.trim(),
      nombre: nombre.trim(),
      rol,
      accesoRutas,
    };

    let url = "/api/usuarios";
    let method = "POST";

    if (usuarioEditando) {
      url = "/api/usuarios";
      method = "PATCH";
      payload.id = usuarioEditando.id;
      payload.username = username.trim();

      if (contrasena.trim()) {
        payload.contrasena = contrasena.trim();
      }
    } else {
      payload.contrasena = contrasena.trim();
      payload.estado = 1;
    }

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      setUsername("");
      setNombre("");
      setContrasena("");
      setRol("vendedor");
      setAccesoRutas(false);
      setUsuarioEditando(null);
      setMensaje(usuarioEditando ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
      cargarUsuarios();
    } else {
      setMensaje(result.message || "Error guardando usuario.");
    }
  }

  async function editarUsuario(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setUsername(usuario.username);
    setNombre(usuario.nombre);
    setRol(usuario.rol);
    setAccesoRutas(Number(usuario.accesoRutas ?? 0) === 1);
    setContrasena("");
    setMensaje("");
  }

  function cancelarEdicion() {
    setUsuarioEditando(null);
    setUsername("");
    setNombre("");
    setContrasena("");
    setRol("vendedor");
    setAccesoRutas(false);
    setMensaje("");
  }

  async function actualizarEstado(usuario: Usuario) {
    setMensaje("");

    const response = await fetch("/api/usuarios", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: usuario.id,
        estado: usuario.estado === 1 ? 0 : 1,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      cargarUsuarios();
      setMensaje("Estado actualizado.");
    } else {
      setMensaje(result.message || "No se pudo actualizar el usuario.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#333333]">
              Usuarios
            </h2>
            <p className="text-gray-600 mt-1">
              Lista de usuarios registrados y su estado.
            </p>
          </div>
        </div>

        {mensaje ? (
          <div className="mb-4 rounded-xl border border-[#F1C380] bg-[#FFF5DE] p-4 text-sm text-[#333333]">
            {mensaje}
          </div>
        ) : null}

        {cargando ? (
          <div className="rounded-xl bg-gray-50 p-6 text-gray-600">Cargando usuarios...</div>
        ) : (
          <div className="space-y-4">
            {usuarios.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-6 text-gray-600">
                No hay usuarios registrados.
              </div>
            ) : (
              usuarios.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-[#333333]">
                      {usuario.nombre} ({usuario.username})
                    </p>
                    <p className="text-sm text-gray-500">Rol: {usuario.rol}</p>
                    <p className="text-sm text-gray-500">
                      Rutas: {Number(usuario.accesoRutas ?? 0) === 1 ? "Todas" : "Solo venta interna"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${usuario.estado === 1 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {usuario.estado === 1 ? "Activo" : "Inactivo"}
                    </span>
                    <button
                      type="button"
                      onClick={() => actualizarEstado(usuario)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#333333] hover:bg-gray-50"
                    >
                      {usuario.estado === 1 ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => editarUsuario(usuario)}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-[#333333] hover:bg-gray-50"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      <Card>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-[#333333]">
            {usuarioEditando ? "Editar usuario" : "Crear usuario"}
          </h2>
          <p className="text-gray-600 mt-1">
            {usuarioEditando
              ? "Actualiza la información del usuario"
              : "Registra un nuevo usuario y asigna un rol."}
          </p>
        </div>

        <form onSubmit={guardarUsuario} className="space-y-4">
          <Input
            label="Usuario"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            type="text"
          />
          <Input
            label="Nombre"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            type="text"
          />
          
          <Input
            label="Contraseña"
            value={contrasena}
            onChange={(event) => setContrasena(event.target.value)}
            type="password"
          />

          <div>
            <label className="block mb-2 text-sm text-gray-700">Rol</label>
            <select
              value={rol}
              onChange={(event) => setRol(event.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F1C380]"
            >
              {roles.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={accesoRutas}
              onChange={(event) => setAccesoRutas(event.target.checked)}
              className="mt-1"
            />
            <span>
              <span className="block font-semibold text-[#333333]">Acceso a rutas externas</span>
              <span className="text-gray-500">
                Si está desactivado, el dashboard solo listará rutas de tipo VENTA_INTERNA.
              </span>
            </span>
          </label>

          <div className="flex gap-3 flex-col sm:flex-row">
            <Button type="submit">
              {usuarioEditando ? "Actualizar usuario" : "Guardar usuario"}
            </Button>
            {usuarioEditando ? (
              <button
                type="button"
                onClick={cancelarEdicion}
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
