import { serverGet } from "@/lib/serverApi";
import type { AssistenciaTecnicaResponse } from "@/lib/getAssistenciaTecnica.type";
import AssistenciaTecnicaList from "@/features/assistenciaTecnica/AssistenciaTecnicaList";

export const dynamic = "force-dynamic";

export default async function AssistenciaTecnicaPage() {
  const data = await serverGet<AssistenciaTecnicaResponse>("/listcontroledeassistenciatecnica", {
    controles: [],
    total: 0,
    totalAguardandoReparo: 0,
    totalFinalizado: 0,
  });

  return <AssistenciaTecnicaList data={data} />;
}
