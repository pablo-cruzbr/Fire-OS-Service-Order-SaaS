"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { StatusBadge } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import type { LaboratorioProps } from "@/lib/getLaboratorio.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { laboratorioEditTransform, laboratorioFields } from "./fields";

export function LaboratorioModal({ data: laboratorio, onClose }: EntityModalProps<LaboratorioProps>) {
  return (
    <DetailModal
      title={laboratorio.nomedoEquipamento || "Controle de laboratório"}
      subtitle="Controle de laboratório"
      onClose={onClose}
      fields={[
        { label: "Status", value: <StatusBadge status={laboratorio.statusControledeLaboratorio?.name} /> },
        { label: "Patrimônio", value: laboratorio.equipamento?.patrimonio },
        { label: "Marca", value: laboratorio.marca },
        { label: "Instituição/unidade", value: laboratorio.instituicaoUnidade?.name },
        { label: "OS de abertura", value: laboratorio.osDeAbertura },
        { label: "OS de devolução", value: laboratorio.osDeDevolucao },
        { label: "Data de chegada", value: formatDate(laboratorio.data_de_Chegada) },
        { label: "Data de finalização", value: formatDate(laboratorio.data_de_Finalizacao) },
        { label: "Técnico", value: laboratorio.tecnico?.name },
        { label: "Cliente", value: laboratorio.cliente?.name },
        { label: "Criado em", value: formatDateTime(laboratorio.created_at) },
        { label: "Defeito", value: laboratorio.defeito, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={laboratorioFields(laboratorio)}
          transform={laboratorioEditTransform(laboratorio)}
          request={{ method: "patch", url: `/controledelaboratorio/update/${laboratorio.id}` }}
          successMessage="Controle de laboratório atualizado!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
