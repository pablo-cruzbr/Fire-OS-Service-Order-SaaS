"use client";

import { TbCircleCheck, TbHourglass, TbTool } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { StatusBadge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { AssistenciaTecnicaProps, AssistenciaTecnicaResponse } from "@/lib/getAssistenciaTecnica.type";

export default function AssistenciaTecnicaList({ data }: { data: AssistenciaTecnicaResponse }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<AssistenciaTecnicaProps>
      title="Assistência técnica"
      breadcrumbs={[{ label: "Controles" }, { label: "Assistência técnica" }]}
      items={data.controles ?? []}
      rowKey={(assistencia) => assistencia.id}
      stats={[
        { label: "Total", value: data.total ?? 0, tone: "primary", icon: <TbTool /> },
        { label: "Aguardando reparo", value: data.totalAguardandoReparo ?? 0, tone: "warning", icon: <TbHourglass /> },
        { label: "Reparo finalizado", value: data.totalFinalizado ?? 0, tone: "success", icon: <TbCircleCheck /> },
      ]}
      search={{
        placeholder: "Buscar patrimônio, OS da assistência...",
        text: (assistencia) => [
          assistencia.equipamento?.patrimonio,
          assistencia.equipamento?.name,
          assistencia.osDaAssistencia,
          assistencia.idChamado,
          assistencia.name,
        ],
      }}
      filters={[
        {
          label: "Status",
          options: (items) => optionsFrom(items, (assistencia) => assistencia.statusReparo?.name),
          match: (assistencia, value) => assistencia.statusReparo?.name === value,
        },
      ]}
      columns={[
        {
          header: "Equipamento",
          cell: (assistencia) => (
            <CellTitle
              title={assistencia.equipamento?.name ?? "—"}
              subtitle={assistencia.equipamento?.patrimonio ? `Patrimônio ${assistencia.equipamento.patrimonio}` : undefined}
            />
          ),
        },
        { header: "OS da assistência", cell: (assistencia) => assistencia.osDaAssistencia || "—" },
        { header: "Instituição/unidade", cell: (assistencia) => assistencia.instituicaoUnidade?.name ?? "—" },
        { header: "Status", cell: (assistencia) => <StatusBadge status={assistencia.statusReparo?.name} /> },
        { header: "Data", cell: (assistencia) => formatDateTime(assistencia.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioAssistenciaTecnica", label: "Novo registro" }}
      onOpen={(assistencia) => openModal("assistencia", assistencia)}
      remove={{
        request: (assistencia) => ({
          url: `/controledeassistenciatecnica/${assistencia.id}`,
          params: { controle_id: assistencia.id },
        }),
        describe: (assistencia) => assistencia.equipamento?.name ?? assistencia.name,
      }}
      emptyMessage="Nenhum registro de assistência técnica ainda."
    />
  );
}
