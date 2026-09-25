import { serverGet } from "@/lib/serverApi";
import type { TecnicoPropsResponse } from "@/lib/getTecnicos.type";
import TecnicosList from "@/features/tecnicos/TecnicosList";

export const dynamic = "force-dynamic";

export default async function TecnicosPage() {
  const data = await serverGet<TecnicoPropsResponse>("/listtecnico", { controles: [], total: 0 });
  return <TecnicosList data={data} />;
}
