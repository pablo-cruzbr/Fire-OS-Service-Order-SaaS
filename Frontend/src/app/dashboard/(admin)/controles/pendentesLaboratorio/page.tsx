import { serverGet } from "@/lib/serverApi";
import type { MaquinasPendentesLabResponse } from "@/lib/getMaquinasPendentesLab.type";
import MaquinasPendentesLabList from "@/features/maquinasPendentesLab/MaquinasPendentesLabList";

export const dynamic = "force-dynamic";

export default async function PendentesLaboratorioPage() {
  const data = await serverGet<MaquinasPendentesLabResponse>("/listcontroledemaquinaspendenteslab", {
    controles: [],
    total: 0,
    totalPendenteOro: 0,
    totalSubstituta: 0,
  });

  return <MaquinasPendentesLabList data={data} />;
}
