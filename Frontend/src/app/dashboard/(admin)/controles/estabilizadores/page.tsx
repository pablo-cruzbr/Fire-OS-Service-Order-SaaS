import { serverGet } from "@/lib/serverApi";
import type { EstabilizadoresResponse } from "@/lib/getEstabilizadores.type";
import EstabilizadoresList from "@/features/estabilizadores/EstabilizadoresList";

export const dynamic = "force-dynamic";

export default async function EstabilizadoresPage() {
  const data = await serverGet<EstabilizadoresResponse>("/listcontroledeestabilizadores", {
    controles: [],
    total: 0,
    totalAguardandoReparo: 0,
    totalFinalizado: 0,
  });

  return <EstabilizadoresList data={data} />;
}
