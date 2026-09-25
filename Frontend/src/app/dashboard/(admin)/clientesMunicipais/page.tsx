import { serverGet } from "@/lib/serverApi";
import type { ClienteMunicipaisResponse, ClientesMunicipaisProps } from "@/lib/getClientesMunicipais.type";
import ClienteMunicipalList from "@/features/clientesMunicipais/ClienteMunicipalList";

export const dynamic = "force-dynamic";

export default async function ClientesMunicipaisPage() {
  const response = await serverGet<{ instituicoes?: ClientesMunicipaisProps[]; total?: number }>("/listinstuicao", {});
  const instituicoes = response.instituicoes ?? [];
  const data: ClienteMunicipaisResponse = { controles: instituicoes, total: response.total ?? instituicoes.length };
  return <ClienteMunicipalList data={data} />;
}
