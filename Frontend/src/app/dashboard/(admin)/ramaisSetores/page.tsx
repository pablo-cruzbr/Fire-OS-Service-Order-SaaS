import { serverGet } from "@/lib/serverApi";
import { toArray } from "@/lib/toArray";
import type { RamaisSetoresProps } from "@/lib/getRamaisSetores.type";
import RamaisSetoresList from "@/features/ramaisSetores/RamaisSetoresList";

export const dynamic = "force-dynamic";

export default async function RamaisSetoresPage() {
  const data = await serverGet<unknown>("/listinformacoessetor", []);
  return <RamaisSetoresList data={toArray<RamaisSetoresProps>(data)} />;
}
