import { serverGet } from "@/lib/serverApi";
import { toArray } from "@/lib/toArray";
import type { EquipamentoProps } from "@/lib/getEquipamento.type";
import EquipamentosList from "@/features/equipamentos/EquipamentosList";

export const dynamic = "force-dynamic";

export default async function EquipamentosPage() {
  const data = await serverGet<unknown>("/listequipamento", []);
  return <EquipamentosList data={toArray<EquipamentoProps>(data)} />;
}
