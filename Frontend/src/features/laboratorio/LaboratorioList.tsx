"use client";

import { TbArrowBackUp, TbFileDescription, TbFlask, TbTool } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { StatusBadge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { LaboratorioProps, LaboratorioResponse } from "@/lib/getLaboratorio.type";

export default function LaboratorioList({ data }: { data: LaboratorioResponse }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<LaboratorioProps>
      title="Controle de laboratório"
      breadcrumbs={[{ label: "Controles" }, { label: "Laboratório" }]}
      items={data.controles ?? []}
      rowKey={(laboratorio) => laboratorio.id}
      stats={[
        { label: "Total", value: data.total ?? 0, tone: "primary", icon: <TbFlask /> },
        { label: "Aguardando conserto", value: data.totalAguardandoConserto ?? 0, tone: "warning", icon: <TbTool /> },
        {
          label: "Aguardando devolução",
          value: data.totalAguardandoDevolucao ?? 0,
          tone: "secondary",
          icon: <TbArrowBackUp />,
        },
        {
          label: "Aguardando OS de laboratório",
          value: data.totalAguardandoOSdeLaboratorio ?? 0,
          tone: "info",
          icon: <TbFileDescription />,
        },
      ]}
      search={{
        placeholder: "Buscar patrimônio, OS de abertura...",
        text: (laboratorio) => [
          laboratorio.equipamento?.patrimonio,
          laboratorio.osDeAbertura,
          laboratorio.osDeDevolucao,
          laboratorio.nomedoEquipamento,
        ],
      }}
      filters={[
        {
          label: "Status",
          options: (items) => optionsFrom(items, (laboratorio) => laboratorio.statusControledeLaboratorio?.name),
          match: (laboratorio, value) => laboratorio.statusControledeLaboratorio?.name === value,
        },
      ]}
      columns={[
        {
          header: "OS de abertura",
          cell: (laboratorio) => (
            <CellTitle title={laboratorio.osDeAbertura || "—"} subtitle={laboratorio.nomedoEquipamento} />
          ),
        },
        { header: "Patrimônio", cell: (laboratorio) => laboratorio.equipamento?.patrimonio ?? "—" },
        { header: "Instituição/unidade", cell: (laboratorio) => laboratorio.instituicaoUnidade?.name ?? "—" },
        {
          header: "Status",
          cell: (laboratorio) => <StatusBadge status={laboratorio.statusControledeLaboratorio?.name} />,
        },
        { header: "Data", cell: (laboratorio) => formatDateTime(laboratorio.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioLaboratorio", label: "Novo registro" }}
      onOpen={(laboratorio) => openModal("laboratorio", laboratorio)}
      remove={{
        request: (laboratorio) => ({
          url: `/deletecontroledelaboratorio/${laboratorio.id}`,
          params: { controle_id: laboratorio.id },
        }),
        describe: (laboratorio) => laboratorio.osDeAbertura || laboratorio.nomedoEquipamento,
      }}
      emptyMessage="Nenhum registro de laboratório ainda."
    />
  );
}
