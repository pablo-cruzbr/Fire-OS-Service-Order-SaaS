"use client";

import { TbDevicesPc } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { EquipamentoProps } from "@/lib/getEquipamento.type";

export default function EquipamentosList({ data }: { data: EquipamentoProps[] }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<EquipamentoProps>
      title="Equipamentos"
      breadcrumbs={[{ label: "Controles" }, { label: "Equipamentos" }]}
      items={data}
      rowKey={(equipamento) => equipamento.id}
      stats={[{ label: "Equipamentos cadastrados", value: data.length, tone: "primary", icon: <TbDevicesPc /> }]}
      search={{
        placeholder: "Buscar patrimônio ou nome...",
        text: (equipamento) => [equipamento.patrimonio, equipamento.name],
      }}
      filters={[
        {
          label: "Unidade",
          options: (items) => optionsFrom(items, (equipamento) => equipamento.instituicaoUnidade?.name),
          match: (equipamento, value) => equipamento.instituicaoUnidade?.name === value,
        },
      ]}
      columns={[
        {
          header: "Equipamento",
          cell: (equipamento) => (
            <CellTitle title={equipamento.name} subtitle={equipamento.tipodeEquipamento?.name} />
          ),
        },
        { header: "Patrimônio", cell: (equipamento) => equipamento.patrimonio ?? "—", className: "whitespace-nowrap" },
        { header: "Unidade", cell: (equipamento) => equipamento.instituicaoUnidade?.name ?? "—" },
        {
          header: "Cadastro",
          cell: (equipamento) => formatDateTime(equipamento.created_at),
          className: "whitespace-nowrap",
        },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioMaquinas", label: "Novo equipamento" }}
      onOpen={(equipamento) => openModal("equipamento", equipamento)}
      remove={{
        request: (equipamento) => ({ url: `/deleteequipamento/${equipamento.id}` }),
        describe: (equipamento) => `${equipamento.patrimonio} - ${equipamento.name}`,
      }}
      emptyMessage="Nenhum equipamento cadastrado ainda."
    />
  );
}
