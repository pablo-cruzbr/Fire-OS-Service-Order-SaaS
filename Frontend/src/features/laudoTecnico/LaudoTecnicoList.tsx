"use client";

import { TbCalendarMonth, TbFileCertificate } from "react-icons/tb";
import { CellTitle, EntityList } from "@/components/data/EntityList";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDate, formatDateTime } from "@/lib/format";
import type { LaudoTecnicoProps } from "@/lib/getLaudoTecnico.type";

function isThisMonth(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export default function LaudoTecnicoList({ items }: { items: LaudoTecnicoProps[] }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<LaudoTecnicoProps>
      title="Laudo técnico"
      breadcrumbs={[{ label: "Controles" }, { label: "Laudo técnico" }]}
      items={items}
      rowKey={(laudo) => laudo.id}
      stats={[
        { label: "Total de laudos", value: items.length, tone: "primary", icon: <TbFileCertificate /> },
        {
          label: "Criados neste mês",
          value: items.filter((laudo) => isThisMonth(laudo.created_at)).length,
          tone: "secondary",
          icon: <TbCalendarMonth />,
        },
      ]}
      search={{
        placeholder: "Buscar patrimônio ou OS...",
        text: (laudo) => [laudo.equipamento?.patrimonio, laudo.equipamento?.name, laudo.osLab],
      }}
      columns={[
        {
          header: "OS do laboratório",
          cell: (laudo) => <CellTitle title={laudo.osLab || "—"} subtitle={laudo.descricaodoProblema} />,
        },
        {
          header: "Equipamento",
          cell: (laudo) => (
            <CellTitle
              title={laudo.equipamento?.name ?? "—"}
              subtitle={laudo.equipamento?.patrimonio ? `Patrimônio ${laudo.equipamento.patrimonio}` : undefined}
            />
          ),
        },
        { header: "Instituição/unidade", cell: (laudo) => laudo.instituicaoUnidade?.name ?? "—" },
        { header: "Data do laudo", cell: (laudo) => formatDate(laudo.mesAno), className: "whitespace-nowrap" },
        { header: "Criado em", cell: (laudo) => formatDateTime(laudo.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioLaudoTecnico", label: "Novo registro" }}
      onOpen={(laudo) => openModal("laudotecnico", laudo)}
      remove={{
        request: (laudo) => ({ url: `/deletecontroledelaudotecnico/${laudo.id}` }),
        describe: (laudo) => (laudo.osLab ? `Laudo ${laudo.osLab}` : "este laudo"),
      }}
      emptyMessage="Nenhum laudo técnico ainda."
    />
  );
}
