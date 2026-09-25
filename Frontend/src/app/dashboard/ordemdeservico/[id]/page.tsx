import { serverGet } from "@/lib/serverApi";
import type { OrdemdeServicoProps } from "@/lib/getOrdemdeServico.type";
import type { Foto } from "@/features/ordens/helpers";
import { OSDetailPage } from "@/features/ordens/OSDetailPage";

export const dynamic = "force-dynamic";

export default async function OrdemdeServicoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [os, fotos] = await Promise.all([
    serverGet<OrdemdeServicoProps | null>(`/ordemdeservico/${id}`, null),
    serverGet<Foto[]>(`/foto/${id}`, []),
  ]);

  return <OSDetailPage os={os?.id ? os : null} fotos={Array.isArray(fotos) ? fotos : []} />;
}
