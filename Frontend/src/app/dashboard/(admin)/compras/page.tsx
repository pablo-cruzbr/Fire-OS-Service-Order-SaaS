import { serverGet } from "@/lib/serverApi";
import type { ComprasResponse } from "@/lib/getCompras.type";
import ComprasList from "@/features/compras/ComprasList";

export const dynamic = "force-dynamic";

export default async function ComprasPage() {
  const data = await serverGet<ComprasResponse>("/listsolicitacaodecompras", {
    controles: [],
    total: 0,
    totalAguardandoCompra: 0,
    totalAguardandoEntrega: 0,
    totalCompraFinalizada: 0,
  });

  return <ComprasList data={data} />;
}
