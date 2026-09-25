"use client";

import { TbBuildingCommunity } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { Badge } from "@/components/ui";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { ClienteMunicipaisResponse, ClientesMunicipaisProps } from "@/lib/getClientesMunicipais.type";

export default function ClienteMunicipalList({ data }: { data: ClienteMunicipaisResponse }) {
  const { openModal } = useGlobalModal();
  const instituicoes = data.controles ?? [];

  return (
    <EntityList<ClientesMunicipaisProps>
      title="Clientes municipais"
      breadcrumbs={[{ label: "Cadastros" }, { label: "Clientes municipais" }]}
      items={instituicoes}
      rowKey={(instituicao) => instituicao.id}
      stats={[
        {
          label: "Total de instituições",
          value: data.total ?? instituicoes.length,
          tone: "primary",
          icon: <TbBuildingCommunity />,
        },
      ]}
      search={{
        placeholder: "Buscar nome, endereço, telefone ou tipo...",
        text: (instituicao) => [
          instituicao.name,
          instituicao.endereco,
          instituicao.telefone,
          instituicao.tipodeinstituicaoUnidade?.name,
        ],
      }}
      filters={[
        {
          label: "Tipo",
          options: (items) => optionsFrom(items, (instituicao) => instituicao.tipodeinstituicaoUnidade?.name),
          match: (instituicao, value) => instituicao.tipodeinstituicaoUnidade?.name === value,
        },
      ]}
      columns={[
        {
          header: "Instituição",
          cell: (instituicao) => <CellTitle title={instituicao.name} subtitle={instituicao.endereco} />,
        },
        {
          header: "Tipo",
          cell: (instituicao) =>
            instituicao.tipodeinstituicaoUnidade?.name ? (
              <Badge tone="secondary">{instituicao.tipodeinstituicaoUnidade.name}</Badge>
            ) : (
              "Não informado"
            ),
        },
        { header: "Telefone", cell: (instituicao) => instituicao.telefone || "—", className: "whitespace-nowrap" },
        {
          header: "Cadastrado em",
          cell: (instituicao) => formatDateTime(instituicao.created_at),
          className: "whitespace-nowrap",
        },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioClientesMunicipais", label: "Nova instituição" }}
      onOpen={(instituicao) => openModal("clienteMunicipal", instituicao)}
      remove={{
        request: (instituicao) => ({ url: "/deleteinstituicao", params: { instituicao_id: instituicao.id } }),
        describe: (instituicao) => instituicao.name,
      }}
      emptyMessage="Nenhum cliente municipal cadastrado."
    />
  );
}
