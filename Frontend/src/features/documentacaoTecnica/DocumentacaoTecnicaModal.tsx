"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { formatDateTime } from "@/lib/format";
import type { DocumentacaoTecnicaProps } from "@/lib/getDocumentacaoTecnica.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { documentacaoFields } from "./fields";

export function DocumentacaoTecnicaModal({ data: doc, onClose }: EntityModalProps<DocumentacaoTecnicaProps>) {
  return (
    <DetailModal
      title={doc.titulo}
      subtitle="Documentação técnica"
      onClose={onClose}
      fields={[
        { label: "Técnico", value: doc.tecnico?.name },
        { label: "Criado em", value: formatDateTime(doc.created_at) },
        { label: "Cliente", value: doc.cliente?.name },
        { label: "Instituição / unidade", value: doc.instituicaoUnidade?.name },
        {
          label: "Descrição",
          value: doc.descricao ? <span className="whitespace-pre-wrap">{doc.descricao}</span> : null,
          full: true,
        },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={documentacaoFields(doc)}
          request={{ method: "patch", url: `/documentacaotecnica/update/${doc.id}` }}
          submitLabel="Salvar alterações"
          successMessage="Documentação atualizada!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
