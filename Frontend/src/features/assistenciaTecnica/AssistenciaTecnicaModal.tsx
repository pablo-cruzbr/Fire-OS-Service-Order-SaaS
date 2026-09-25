"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { StatusBadge } from "@/components/ui";
import { formatDate, formatDateTime, formatMonthYear } from "@/lib/format";
import type { AssistenciaTecnicaProps } from "@/lib/getAssistenciaTecnica.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { assistenciaTecnicaFields } from "./fields";

export function AssistenciaTecnicaModal({ data: assistencia, onClose }: EntityModalProps<AssistenciaTecnicaProps>) {
  const equipamento = assistencia.equipamento;

  return (
    <DetailModal
      title={assistencia.name || equipamento?.name || "Assistência técnica"}
      subtitle="Assistência técnica"
      onClose={onClose}
      fields={[
        { label: "Status", value: <StatusBadge status={assistencia.statusReparo?.name} /> },
        { label: "Cliente", value: assistencia.cliente?.name },
        { label: "Equipamento", value: equipamento?.name },
        { label: "Patrimônio", value: equipamento?.patrimonio },
        { label: "Assistência", value: assistencia.assistencia },
        { label: "OS da assistência", value: assistencia.osDaAssistencia },
        { label: "ID do chamado", value: assistencia.idChamado },
        { label: "Técnico responsável", value: assistencia.tecnico?.name },
        { label: "Instituição/unidade", value: assistencia.instituicaoUnidade?.name },
        { label: "Mês/ano", value: formatMonthYear(assistencia.mesAno) },
        { label: "Data de retirada", value: formatDate(assistencia.dataDeRetirada) },
        { label: "Criado em", value: formatDateTime(assistencia.created_at) },
        { label: "Observações", value: assistencia.observacoes, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={assistenciaTecnicaFields(assistencia)}
          request={{ method: "patch", url: `/assistenciatecnica/update/${assistencia.id}` }}
          successMessage="Assistência técnica atualizada!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
