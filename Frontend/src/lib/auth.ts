import { cookies } from "next/headers";

const THIRTY_DAYS = 60 * 60 * 24 * 30; // seconds — cookie maxAge is in seconds

/** Stores the session token returned by POST /session. */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    maxAge: THIRTY_DAYS,
    path: "/",
    // Client components still read the token to call the API directly,
    // so it can't be httpOnly until those calls go through the server.
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export const loginErrors: Record<string, string> = {
  credentials: "E-mail ou senha incorretos.",
  no_admin: "Acesso negado: este portal é exclusivo para administradores e técnicos.",
  server: "Não foi possível conectar ao servidor. Tente novamente em instantes.",
};

export function loginErrorMessage(code?: string) {
  if (!code) return null;
  return loginErrors[code] ?? decodeURIComponent(code);
}
