"use client";

import { TbTool } from "react-icons/tb";
import { CellTitle, EntityList } from "@/components/data/EntityList";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { TecnicoPropsResponse, TecnicosProps } from "@/lib/getTecnicos.type";

export default function TecnicosList({ data }: { data: TecnicoPropsResponse }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<TecnicosProps>
      title="Técnicos"
      breadcrumbs={[{ label: "Administração" }, { label: "Técnicos" }]}
      items={data.controles ?? []}
      rowKey={(tecnico) => tecnico.id}
      stats={[{ label: "Técnicos cadastrados", value: data.total ?? 0, tone: "primary", icon: <TbTool /> }]}
      search={{ placeholder: "Buscar técnico...", text: (tecnico) => [tecnico.name] }}
      columns={[
        { header: "Nome", cell: (tecnico) => <CellTitle title={tecnico.name} /> },
        { header: "Cadastro", cell: (tecnico) => formatDateTime(tecnico.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioTecnicoAdd", label: "Novo técnico" }}
      onOpen={(tecnico) => openModal("tecnico", tecnico)}
      remove={{
        request: (tecnico) => ({ url: `/removertecnico/${tecnico.id}`, params: { tecnico_id: tecnico.id } }),
        describe: (tecnico) => tecnico.name,
      }}
      emptyMessage="Nenhum técnico cadastrado ainda."
    />
  );
}
