"use client";

import { useState } from "react";
import ManageUsers from "@/components/admin/ManageUsers";
import ManageMetas from "@/components/admin/ManageMetas";
import AssignSucursales from "@/components/admin/AssignSucursales";

const sections = [
  { id: "usuarios", label: "Gestionar Usuarios" },
  { id: "metas", label: "Gestionar Metas" },
  { id: "sucursales", label: "Asignar Sucursales" },
];

export default function AdminClient() {
  const [activeSection, setActiveSection] = useState("usuarios");

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#333333]">
              Panel Administrativo
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona usuarios, metas y la asignación de sucursales a jefes.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                activeSection === section.id
                  ? "border-[#F1C380] bg-[#FFF5DE]"
                  : "border-gray-200 bg-white hover:border-[#F1C380]"
              }`}
            >
              <span className="block font-semibold text-[#333333]">
                {section.label}
              </span>
            </button>
          ))}
        </div>

        {activeSection === "usuarios" && <ManageUsers />}
        {activeSection === "metas" && <ManageMetas />}
        {activeSection === "sucursales" && <AssignSucursales />}
      </div>
    </main>
  );
}
