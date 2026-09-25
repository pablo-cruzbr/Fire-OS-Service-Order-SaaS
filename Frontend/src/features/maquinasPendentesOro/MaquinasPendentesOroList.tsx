"use client";

import { TbArchive, TbCircleCheck, TbDeviceDesktop, TbPackageExport, TbPlugConnected, TbTool } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { StatusBadge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDate, formatDateTime } from "@/lib/format";
import type { MaquinasPendentesLabPropsResponse, MaquinasPendentesOroProps } from "@/lib/getMaquinasPendentesOro.type";

export default function MaquinasPendentesOroList({ data }: { data: MaquinasPendentesLabPropsResponse }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<MaquinasPendentesOroProps>
      title="Máquinas pendentes ORO"
      breadcrumbs={[{ label: "Controles" }, { label: "Pendentes ORO" }]}
      items={data.controles ?? []}
      rowKey={(maquina) => maquina.id}
      stats={[
        { label: "Total", value: data.total ?? 0, tone: "primary", icon: <TbDeviceDesktop /> },
        { label: "Disponível", value: data.totalDisponivel ?? 0, tone: "success", icon: <TbCircleCheck /> },
        { label: "Instalada", value: data.totalInstalada ?? 0, tone: "info", icon: <TbPlugConnected /> },
        { label: "Em manutenção", value: data.totalEmManutencao ?? 0, tone: "secondary", icon: <TbTool /> },
        {
          label: "Aguardando retirada",
          value: data.totalAguardandoRetirada ?? 0,
          tone: "warning",
          icon: <TbPackageExport />,
        },
        { label: "Descartada", value: data.totalDescartada ?? 0, tone: "error", icon: <TbArchive /> },
      ]}
      search={{
        placeholder: "Buscar patrimônio ou OS...",
        text: (maquina) => [maquina.equipamento?.patrimonio, maquina.osInstalacao, maquina.osRetirada],
      }}
      filters={[
        {
          label: "Status",
          options: (items) => optionsFrom(items, (maquina) => maquina.statusMaquinasPendentesOro?.name),
          match: (maquina, value) => maquina.statusMaquinasPendentesOro?.name === value,
        },
      ]}
      columns={[
        {
          header: "Máquina",
          cell: (maquina) => (
            <CellTitle title={maquina.equipamento?.name ?? "—"} subtitle={maquina.equipamento?.patrimonio} />
          ),
        },
        { header: "Unidade", cell: (maquina) => maquina.instituicaoUnidade?.name ?? "—" },
        {
          header: "Instalação",
          cell: (maquina) => formatDate(maquina.datadaInstalacao),
          className: "whitespace-nowrap",
        },
        { header: "Status", cell: (maquina) => <StatusBadge status={maquina.statusMaquinasPendentesOro?.name} /> },
        { header: "Data", cell: (maquina) => formatDateTime(maquina.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioPendentesOro", label: "Novo registro" }}
      onOpen={(maquina) => openModal("maquinasPendentesOro", maquina)}
      remove={{
        request: (maquina) => ({
          url: `/deletecontroledemaquinaspendentesoro/${maquina.id}`,
          params: { controle_id: maquina.id },
        }),
        describe: (maquina) => maquina.equipamento?.patrimonio ?? maquina.osInstalacao,
      }}
      emptyMessage="Nenhuma máquina pendente ORO."
    />
  );
}
