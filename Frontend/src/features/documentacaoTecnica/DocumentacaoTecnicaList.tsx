"use client";

import { TbFileText } from "react-icons/tb";
import { CellTitle, EntityList, optionsFrom } from "@/components/data/EntityList";
import { useGlobalModal } from "@/provider/GlobalModalProvider";
import { formatDateTime } from "@/lib/format";
import type { DocumentacaoTecnicaProps } from "@/lib/getDocumentacaoTecnica.type";

export default function DocumentacaoTecnicaList({ data }: { data: DocumentacaoTecnicaProps[] }) {
  const { openModal } = useGlobalModal();

  return (
    <EntityList<DocumentacaoTecnicaProps>
      title="Documentação técnica"
      breadcrumbs={[{ label: "Controles" }, { label: "Documentação técnica" }]}
      items={data}
      rowKey={(doc) => doc.id}
      stats={[{ label: "Documentos", value: data.length, tone: "primary", icon: <TbFileText /> }]}
      search={{
        placeholder: "Buscar título, descrição, técnico ou cliente...",
        text: (doc) => [doc.titulo, doc.descricao, doc.tecnico?.name, doc.cliente?.name, doc.instituicaoUnidade?.name],
      }}
      filters={[
        {
          label: "Técnico",
          options: (items) => optionsFrom(items, (doc) => doc.tecnico?.name),
          match: (doc, value) => doc.tecnico?.name === value,
        },
      ]}
      columns={[
        {
          header: "Título",
          cell: (doc) => (
            <CellTitle
              title={doc.titulo}
              subtitle={doc.descricao && doc.descricao.length > 80 ? `${doc.descricao.slice(0, 80)}…` : doc.descricao}
            />
          ),
        },
        { header: "Técnico", cell: (doc) => doc.tecnico?.name ?? "—" },
        {
          header: "Cliente / instituição",
          cell: (doc) => doc.cliente?.name ?? doc.instituicaoUnidade?.name ?? "Nenhum vínculo",
        },
        { header: "Criado em", cell: (doc) => formatDateTime(doc.created_at), className: "whitespace-nowrap" },
      ]}
      add={{ href: "/dashboard/formulariosadd/formularioDocumentacaoTecnica", label: "Nova documentação" }}
      onOpen={(doc) => openModal("documentacaoTecnica", doc)}
      remove={{
        request: (doc) => ({ url: `/deletedocumentacaotecnica/${doc.id}`, params: { id: doc.id } }),
        describe: (doc) => doc.titulo,
      }}
      emptyMessage="Nenhuma documentação técnica ainda."
    />
  );
}
