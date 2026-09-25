import type { Metadata } from "next";
import { serverGet } from "@/lib/serverApi";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import type { Foto } from "@/features/ordens/helpers";
import { OSDigitalView } from "@/features/ordens/OSDigitalView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Ordem de serviço digital - Fire OS" };

export default async function OSDigitalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [os, fotos] = await Promise.all([
    serverGet<OrdemdeServicoProps | null>(`/ordemdeservico/${id}`, null),
    serverGet<Foto[]>(`/foto/${id}`, []),
  ]);

  return <OSDigitalView os={os?.id ? os : null} fotos={Array.isArray(fotos) ? fotos : []} />;
}
