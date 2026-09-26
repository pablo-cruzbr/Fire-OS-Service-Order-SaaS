import { TbListDetails } from "react-icons/tb";
import { ButtonLink, PageHeader } from "@/components/ui";
import { serverGet } from "@/lib/serverApi";
import { TechCalendar } from "@/features/calendario/TechCalendar";
import type { OrdemdeServicoResponseData } from "@/lib/getOrdemdeServico.type";

export const dynamic = "force-dynamic";

export default async function CalendarioTecnicoPage() {
  const data = await serverGet<Partial<OrdemdeServicoResponseData>>("/listordemdeservico", { controles: [] });

  return (
    <section>
      <PageHeader
        title="Calendário técnico"
        breadcrumbs={[{ label: "Administração" }, { label: "Calendário técnico" }]}
        actions={
          <ButtonLink href="/dashboard/tickets" variant="outline" className="bg-card" icon={<TbListDetails className="h-4 w-4" />}>
            Lista de chamados
          </ButtonLink>
        }
      />
      <TechCalendar ordens={data.controles ?? []} />
    </section>
  );
}
