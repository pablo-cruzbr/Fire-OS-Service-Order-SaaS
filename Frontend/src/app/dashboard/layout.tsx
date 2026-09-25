import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.role === "USER") redirect("/AreadeUsuario/formularioAddTickets");

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
