"use client";

import { TbBolt, TbCircleCheck, TbHourglass, TbPlus } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { ButtonLink, StatusBadge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { EstabilizadoresProps, EstabilizadoresResponse } from "@/lib/getEstabilizadores.type";

export default function EstabilizadoresList({ data }: { data: EstabilizadoresResponse }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<EstabilizadoresProps>
      title="Controle de estabilizadores"
      breadcrumbs={[{ label: "Controles" }, { label: "Estabilizadores" }]}
      items={data.controles ?? []}
      rowKey={(controle) => controle.id}
      stats={[
        { label: "Total", value: data.total ?? 0, tone: "primary", icon: <TbBolt /> },
        { label: "Aguardando reparo", value: data.totalAguardandoReparo ?? 0, tone: "warning", icon: <TbHourglass /> },
        { label: "Finalizado", value: data.totalFinalizado ?? 0, tone: "success", icon: <TbCircleCheck /> },
      ]}
      search={{
        placeholder: "Buscar patrimônio ou OS da assistência...",
        text: (controle) => [
          controle.estabilizadores?.patrimonio,
          controle.estabilizadores?.name,
          controle.osdaAssistencia,
          controle.idChamado,
        ],
      }}
      filters={[
        {
          label: "Status",
          options: (items) => optionsFrom(items, (controle) => controle.statusEstabilizadores?.name),
          match: (controle, value) => controle.statusEstabilizadores?.name === value,
        },
      ]}
      columns={[
        {
          header: "Estabilizador",
          cell: (controle) => (
            <CellTitle
              title={controle.estabilizadores?.name ?? "—"}
              subtitle={
                controle.estabilizadores?.patrimonio ? `Patrimônio ${controle.estabilizadores.patrimonio}` : undefined
              }
            />
          ),
        },
        { header: "Problema", cell: (controle) => controle.problema || "—" },
        { header: "OS da assistência", cell: (controle) => controle.osdaAssistencia || "—" },
        { header: "Status", cell: (controle) => <StatusBadge status={controle.statusEstabilizadores?.name} /> },
        { header: "Data", cell: (controle) => formatDateTime(controle.created_at), className: "whitespace-nowrap" },
      ]}
      headerActions={
        <ButtonLink
          href="/dashboard/formulariosadd/formularioEstabilizadorAdd"
          variant="outline"
          className="bg-card"
          icon={<TbPlus className="h-4 w-4" />}
        >
          Registrar estabilizador
        </ButtonLink>
      }
      add={{ href: "/dashboard/formulariosadd/formularioControledeEstabilizadores", label: "Novo registro" }}
      onOpen={(controle) => openModal("Estabilizadores", controle)}
      emptyMessage="Nenhum controle de estabilizador ainda."
    />
  );
}
