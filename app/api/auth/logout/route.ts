import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

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

export async function POST(request: NextRequest) {
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

  return response;
}
