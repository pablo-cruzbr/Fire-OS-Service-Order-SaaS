"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction(formData?: FormData) {
  const cookieStore = await cookies();
  const cookiesToClear = ["session", "token", "role", "isAdmin", "user_id"];

  cookiesToClear.forEach(name => {
    cookieStore.delete(name);
  });

  // End users go back to their own login page; staff to the admin portal.
  redirect(formData?.get("redirectTo") === "/AreadeUsuario" ? "/AreadeUsuario" : "/login");
}
