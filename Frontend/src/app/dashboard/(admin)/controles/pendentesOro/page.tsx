import { serverGet } from "@/lib/serverApi";
import type { MaquinasPendentesLabPropsResponse } from "@/lib/getMaquinasPendentesOro.type";
import MaquinasPendentesOroList from "@/features/maquinasPendentesOro/MaquinasPendentesOroList";

export const dynamic = "force-dynamic";

export default async function PendentesOroPage() {
  const data = await serverGet<MaquinasPendentesLabPropsResponse>("/listcontroledemaquinaspendentesoro", {
    controles: [],
    total: 0,
    totalAguardandoRetirada: 0,
    totalDescartada: 0,
    totalDisponivel: 0,
    totalEmManutencao: 0,
    totalInstalada: 0,
  });

  return <MaquinasPendentesOroList data={data} />;
}
