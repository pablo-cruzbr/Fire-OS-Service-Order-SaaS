"use client";

import { TbDeviceDesktopCog, TbHourglass, TbReplace } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { StatusBadge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { MaquinasPendentesLabProps, MaquinasPendentesLabResponse } from "@/lib/getMaquinasPendentesLab.type";

export default function MaquinasPendentesLabList({ data }: { data: MaquinasPendentesLabResponse }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<MaquinasPendentesLabProps>
      title="Máquinas pendentes laboratório"
      breadcrumbs={[{ label: "Controles" }, { label: "Pendentes laboratório" }]}
      items={data.controles ?? []}
      rowKey={(maquina) => maquina.id}
      stats={[
        { label: "Total", value: data.total ?? 0, tone: "primary", icon: <TbDeviceDesktopCog /> },
        { label: "Pendente ORO", value: data.totalPendenteOro ?? 0, tone: "warning", icon: <TbHourglass /> },
        { label: "Substituta", value: data.totalSubstituta ?? 0, tone: "secondary", icon: <TbReplace /> },
      ]}
      search={{
        placeholder: "Buscar patrimônio ou OS...",
        text: (maquina) => [maquina.equipamento?.patrimonio, maquina.idDaOs],
      }}
      filters={[
        {
          label: "Status",
          options: (items) => optionsFrom(items, (maquina) => maquina.statusMaquinasPendentesLab?.name),
          match: (maquina, value) => maquina.statusMaquinasPendentesLab?.name === value,
        },
      ]}
      columns={[
        {
          header: "Máquina",
          cell: (maquina) => (
            <CellTitle title={maquina.equipamento?.name ?? "—"} subtitle={maquina.equipamento?.patrimonio} />
          ),
        },
        { header: "OS", cell: (maquina) => maquina.idDaOs ?? "—", className: "whitespace-nowrap" },
        { header: "SSD", cell: (maquina) => maquina.ssd ?? "—" },
        { header: "Status", cell: (maquina) => <StatusBadge status={maquina.statusMaquinasPendentesLab?.name} /> },
        { header: "Data", cell: (maquina) => formatDateTime(maquina.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioPendentesLab", label: "Novo registro" }}
      onOpen={(maquina) => openModal("maquinasPendentesLab", maquina)}
      remove={{
        request: (maquina) => ({ url: `/deletecontroledemaquinaspendenteslab/${maquina.id}` }),
        describe: (maquina) => maquina.equipamento?.patrimonio ?? maquina.numeroDeSerie,
      }}
      emptyMessage="Nenhuma máquina pendente no laboratório."
    />
  );
}
