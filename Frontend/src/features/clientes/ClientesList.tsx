"use client";

import { TbBuildingStore } from "react-icons/tb";
import { CellTitle, EntityList } from "@/components/data/EntityList";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { ClienteResponse, ClientesProps } from "@/lib/getCliente.type";

export default function ClientesList({ data }: { data: ClienteResponse }) {
  const { openModal } = useGlobalModal();
  const clientes = data.controles ?? [];

  return (
    <EntityList<ClientesProps>
      title="Clientes privados"
      breadcrumbs={[{ label: "Cadastros" }, { label: "Clientes privados" }]}
      items={clientes}
      rowKey={(cliente) => cliente.id}
      stats={[{ label: "Total de clientes", value: data.total ?? clientes.length, tone: "primary", icon: <TbBuildingStore /> }]}
      search={{
        placeholder: "Buscar nome, CNPJ ou endereço...",
        text: (cliente) => [cliente.name, cliente.cnpj, cliente.endereco, cliente.telefone],
      }}
      columns={[
        { header: "Cliente", cell: (cliente) => <CellTitle title={cliente.name} subtitle={cliente.endereco} /> },
        { header: "CNPJ", cell: (cliente) => cliente.cnpj || "Não cadastrado", className: "whitespace-nowrap" },
        { header: "Telefone", cell: (cliente) => cliente.telefone || "—", className: "whitespace-nowrap" },
        { header: "Cadastrado em", cell: (cliente) => formatDateTime(cliente.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioClientesPrivados", label: "Novo cliente" }}
      onOpen={(cliente) => openModal("cliente", cliente)}
      remove={{
        request: (cliente) => ({ url: `/deletecliente/${cliente.id}` }),
        describe: (cliente) => cliente.name,
      }}
      emptyMessage="Nenhum cliente privado cadastrado."
    />
  );
}
