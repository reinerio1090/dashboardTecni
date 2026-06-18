import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { isAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (!isAdminSession(token)) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);

    const fechaInicio = searchParams.get("inicio");
    const fechaFin = searchParams.get("fin");
    const sucursales = searchParams.get("sucursales");
    const rutas = searchParams.get("rutas");

    console.log("Parámetros recibidos:", { fechaInicio, fechaFin, sucursales, rutas });

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json(
        {
          success: false,
          message: "Debe enviar fecha inicio y fecha fin",
        },
        { status: 400 }
      );
    }

    // Test simple query
    const [test]: any = await pool.query(
      `SELECT COUNT(*) as count FROM facturas`
    );
    console.log("Test query result:", test);

    return NextResponse.json({
      success: true,
      debug: {
        params: { fechaInicio, fechaFin, sucursales, rutas },
        testQuery: test,
      },
    });
  } catch (error: any) {
    console.error("Error en debug endpoint:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error en debug endpoint",
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
