import { serverGet } from "@/lib/serverApi";
import { toArray } from "@/lib/toArray";
import type { LaudoTecnicoProps } from "@/lib/getLaudoTecnico.type";
import LaudoTecnicoList from "@/features/laudoTecnico/LaudoTecnicoList";

export const dynamic = "force-dynamic";

export default async function LaudoTecnicoPage() {
  const data = await serverGet<unknown>("/listcontroledelaudotecnico", []);
  return <LaudoTecnicoList items={toArray<LaudoTecnicoProps>(data)} />;
}
