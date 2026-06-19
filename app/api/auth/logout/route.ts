import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieName, verifyAuthToken } from "@/lib/auth";

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
  const session = verifyAuthToken(request.cookies.get(getSessionCookieName())?.value);
  const response = NextResponse.json({
    success: true,
    message: "Sesion cerrada.",
  });

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    path: "/",
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    maxAge: 0,
  });

  if (session) {
    console.info("[auth] Usuario desconectado", {
      id: session.id,
      username: session.username,
      nombre: session.nombre,
      ip: getClientIp(request),
      fecha: new Date().toISOString(),
    });
  }

  return response;
}
