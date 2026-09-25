import { cache } from "react";
import { redirect } from "next/navigation";
import { api } from "@/services/api";
import { getCookieServer } from "@/lib/cookieServer";
import { MOCK_API } from "@/mocks/enabled";

export type Role = "ADMIN" | "TECNICO" | "USER";

export type SessionUser = {
  id: string;
  name: string;
  email?: string;
  role: Role;
};

/**
 * The signed-in user, resolved on the server from the session token.
 * The role always comes from the API — never from a cookie the browser can edit.
 * Cached per request, so layouts and pages can all call it.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getCookieServer();
  if (!token && !MOCK_API) return null;

  try {
    const { data } = await api.get("/users/detail", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!data?.id) return null;
    return {
      id: data.id,
      name: data.name ?? "Usuário",
      email: data.email,
      role: (data.role?.toUpperCase() ?? "USER") as Role,
    };
  } catch {
    return null;
  }
});

/** Redirects away unless the signed-in user has one of the given roles. */
export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) {
    redirect(user.role === "USER" ? "/AreadeUsuario/formularioAddTickets" : "/dashboard");
  }
  return user;
}
