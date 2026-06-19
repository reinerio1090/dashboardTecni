import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, getSessionCookieName } from "@/lib/auth";

function shouldUseSecureCookie(request: NextRequest) {
  if (process.env.COOKIE_SECURE === "true") {
    return true;
  }

  if (process.env.COOKIE_SECURE === "false") {
    return false;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");

  return forwardedProto === "https" || request.nextUrl.protocol === "https:";
}

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "desconocida";
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Usuario y contraseña son obligatorios.",
        },
        { status: 400 }
      );
    }

    const result = await authenticateUser(username, password);
    if (!result) {
      console.warn("[auth] Inicio de sesion rechazado", {
        username,
        ip: getClientIp(request),
        fecha: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          success: false,
          message: "Usuario o contraseña incorrectos.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Inicio de sesión correcto.",
      data: result.payload,
    });

    response.cookies.set({
      name: getSessionCookieName(),
      value: result.token,
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: shouldUseSecureCookie(request),
      maxAge: 60 * 60 * 24 * 7,
    });

    console.info("[auth] Usuario conectado", {
      id: result.payload.id,
      username: result.payload.username,
      nombre: result.payload.nombre,
      rol: result.payload.rol,
      ip: getClientIp(request),
      fecha: new Date().toISOString(),
    });

    return response;
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error de autenticación.",
      },
      { status: 500 }
    );
  }
}
