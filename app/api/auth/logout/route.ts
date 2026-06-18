import { NextResponse } from "next/server";
import { getSessionCookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Sesión cerrada.",
  });

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    path: "/",
    maxAge: 0,
  });

  return response;
}
