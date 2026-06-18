import { createHmac } from "crypto";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

const SECRET = process.env.AUTH_SECRET || "dashboard-comercial-secret";
const COOKIE_NAME = "session";

export interface AuthPayload {
  id: number;
  nombre: string;
  username: string;
  //email: string | null;
  rol: string;
  accesoRutas: boolean;
}

function base64UrlEncode(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");

  return Buffer.from(base64, "base64").toString("utf8");
}

function sign(payload: AuthPayload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(
    createHmac("sha256", SECRET).update(body).digest("base64")
  );
  return `${body}.${signature}`;
}

export function verifyAuthToken(token: string | undefined) {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = base64UrlEncode(
    createHmac("sha256", SECRET).update(body).digest("base64")
  );

  if (signature !== expected) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(body)) as AuthPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(username: string, password: string) {
  const [rows]: any = await pool.query(
    `
    SELECT
      id,
      username,
      nombres,
      id_rol,
      estado,
      password_hash,
      COALESCE(acceso_rutas, 0) AS acceso_rutas
    FROM dashboard_users
    WHERE username = ?
      AND estado = 1
    LIMIT 1
  `,
    [username]
  );

  const user = rows?.[0];
  if (!user) {
    return null;
  }

    //console.log("Password hash de prueba para 'admin123':", await bcrypt.hash('admin123', 10));

  const validHash = await bcrypt.compare(password, user.password_hash);
  const valid = validHash || password === user.password_hash;
  if (!valid) {
    return null;
  }

  const rol =
    user.id_rol === 1
      ? "admin"
      : user.id_rol === 2
      ? "jefe"
      : "usuario";

  const payload: AuthPayload = {
    id: user.id,
    nombre: user.nombres,
    username: user.username,
   // email: user.email || null,
    rol,
    accesoRutas: Number(user.acceso_rutas ?? 0) === 1,
  };

  return {
    token: sign(payload),
    payload,
  };
}

export function getSessionCookieValue(payload: AuthPayload) {
  return sign(payload);
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function isAdminSession(token: string | undefined) {
  const payload = verifyAuthToken(token);
  return payload?.rol === "admin" ? payload : null;
}
