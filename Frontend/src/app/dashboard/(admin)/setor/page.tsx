import { serverGet } from "@/lib/serverApi";
import { toArray } from "@/lib/toArray";
import type { SetoresProps } from "@/lib/getSetores.type";
import SetoresList from "@/features/setores/SetoresList";

export const dynamic = "force-dynamic";

export default async function SetoresPage() {
  const data = await serverGet<unknown>("/listsetores", []);
  return <SetoresList data={toArray<SetoresProps>(data)} />;
}
