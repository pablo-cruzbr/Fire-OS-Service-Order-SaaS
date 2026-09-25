import { requireRole } from "@/lib/session";

/**
 * Administration area (controles, clientes, usuários, cadastros, calendário).
 * The route group keeps the URLs unchanged; this layout blocks non-admins on
 * the server instead of only hiding the links in the sidebar.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("ADMIN");
  return children;
}
