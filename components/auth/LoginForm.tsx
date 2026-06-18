"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensaje("");

    if (!username.trim() || !password.trim()) {
      setMensaje("Completa usuario y contraseña.");
      return;
    }

    setCargando(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    });

    const result = await response.json();
    setCargando(false);

    if (!response.ok || !result.success) {
      setMensaje(result.message || "Usuario o contraseña incorrectos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card>
      <div className="w-full mx-auto max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#F1C380]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#333333]">
          Dashboard Comercial
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-8">
          Ingrese sus credenciales
        </p>

        {mensaje ? (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {mensaje}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Input
            label="Usuario"
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </Card>
  );
}
