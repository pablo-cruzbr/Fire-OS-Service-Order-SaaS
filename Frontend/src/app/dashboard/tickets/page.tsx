import { requireRole } from "@/lib/session";
import { serverGet } from "@/lib/serverApi";
import type { OrdemdeServicoResponseData } from "@/lib/getOrdemdeServico.type";
import OrdensList from "@/features/ordens/OrdensList";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  await requireRole("ADMIN", "TECNICO");

  const data = await serverGet<OrdemdeServicoResponseData>("/listordemdeservico", {
    controles: [],
    total: 0,
    totalAberta: 0,
    totalEmDeslocamento: 0,
    totalEmAndamento: 0,
    totalConcluida: 0,
    totalPausada: 0,
    totalTicket: 0,
    totalOrdemdeServico: 0,
  });

  return <OrdensList data={data} />;
}
