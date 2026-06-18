interface KpiCardProps {
  titulo: string;
  valor: string | number;
  detalle?: string | number;
  detalleSecundario?: string | number;
  icono?: string;
  tono?: "ventas" | "facturas" | "cobros" | "cartera";
}

const tonos = {
  ventas: {
    fondo: "bg-[#2bbd7e]",
    pie: "bg-[#16a367]",
  },
  facturas: {
    fondo: "bg-[#31a8d8]",
    pie: "bg-[#258fbc]",
  },
  cobros: {
    fondo: "bg-[#f7b544]",
    pie: "bg-[#d69218]",
  },
  cartera: {
    fondo: "bg-[#ef1b1b]",
    pie: "bg-[#d40808]",
  },
};

export default function KpiCard({
  titulo,
  valor,
  detalle,
  detalleSecundario,
  icono = "$",
  tono = "ventas",
}: KpiCardProps) {
  const colores = tonos[tono];

  return (
    <div className={`overflow-hidden rounded-none text-white shadow-sm ${colores.fondo}`}>
      <div className="flex min-h-20 items-start justify-between gap-3 px-4 py-3">
        <div className="text-5xl font-bold leading-none text-white/95">
          {icono}
        </div>

        <div className="min-w-0 text-right">
          <p className="truncate text-2xl font-light leading-tight sm:text-3xl">
            {valor}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-white">
            {detalle ?? titulo}
          </p>
        </div>
      </div>

      <div className={`px-3 py-1.5 text-[10px] font-semibold uppercase ${colores.pie}`}>
        {detalleSecundario ?? titulo}
      </div>
    </div>
  );
}
