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
