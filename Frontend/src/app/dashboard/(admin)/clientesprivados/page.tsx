import { serverGet } from "@/lib/serverApi";
import type { ClienteResponse } from "@/lib/getCliente.type";
import ClientesList from "@/features/clientes/ClientesList";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const data = await serverGet<ClienteResponse>("/listcliente", { controles: [], total: 0 });
  return <ClientesList data={data} />;
}
