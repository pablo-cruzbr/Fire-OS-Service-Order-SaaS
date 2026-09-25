import { serverGet } from "@/lib/serverApi";
import type { LaboratorioResponse } from "@/lib/getLaboratorio.type";
import LaboratorioList from "@/features/laboratorio/LaboratorioList";

export const dynamic = "force-dynamic";

export default async function LaboratorioPage() {
  const data = await serverGet<LaboratorioResponse>("/listcontroledelaboratorio", {
    controles: [],
    total: 0,
    totalAguardandoConserto: 0,
    totalAguardandoDevolucao: 0,
    totalAguardandoOSdeLaboratorio: 0,
  });

  return <LaboratorioList data={data} />;
}
