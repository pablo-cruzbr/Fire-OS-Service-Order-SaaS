"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { StatusBadge } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import type { EstabilizadoresProps } from "@/lib/getEstabilizadores.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { controleEstabilizadorFields } from "./fields";

export function EstabilizadoresModal({ data: controle, onClose }: EntityModalProps<EstabilizadoresProps>) {
  const estabilizador = controle.estabilizadores;

  return (
    <DetailModal
      title={estabilizador?.name ?? "Controle de estabilizador"}
      subtitle="Controle de estabilizadores"
      onClose={onClose}
      fields={[
        { label: "Status", value: <StatusBadge status={controle.statusEstabilizadores?.name} /> },
        { label: "Patrimônio", value: estabilizador?.patrimonio },
        { label: "ID do chamado", value: controle.idChamado },
        { label: "OS da assistência", value: controle.osdaAssistencia },
        { label: "Data de chegada", value: formatDate(controle.datadeChegada) },
        { label: "Data de retirada", value: formatDate(controle.datadeRetirada) },
        { label: "Instituição/unidade", value: controle.instituicaoUnidade?.name },
        { label: "Endereço", value: controle.instituicaoUnidade?.endereco },
        { label: "Criado em", value: formatDateTime(controle.created_at) },
        { label: "Problema", value: controle.problema, full: true },
        { label: "Observações", value: controle.observacoes, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={controleEstabilizadorFields(controle)}
          request={{ method: "patch", url: `/update/controledeestabilizadores/${controle.id}` }}
          successMessage="Estabilizador atualizado!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
