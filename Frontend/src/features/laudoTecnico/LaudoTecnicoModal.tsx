"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { formatDate, formatDateTime } from "@/lib/format";
import type { LaudoTecnicoProps } from "@/lib/getLaudoTecnico.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { laudoTecnicoFields } from "./fields";

export function LaudoTecnicoModal({ data: laudo, onClose }: EntityModalProps<LaudoTecnicoProps>) {
  return (
    <DetailModal
      title={laudo.osLab ? `Laudo ${laudo.osLab}` : "Laudo técnico"}
      subtitle="Laudo técnico"
      onClose={onClose}
      fields={[
        { label: "OS do laboratório", value: laudo.osLab },
        { label: "Data (mês/ano)", value: formatDate(laudo.mesAno) },
        { label: "Equipamento", value: laudo.equipamento?.name },
        { label: "Patrimônio", value: laudo.equipamento?.patrimonio },
        { label: "Instituição/unidade", value: laudo.instituicaoUnidade?.name },
        { label: "Endereço", value: laudo.instituicaoUnidade?.endereco },
        { label: "Técnico responsável", value: laudo.tecnico?.name },
        { label: "Criado em", value: formatDateTime(laudo.created_at) },
        { label: "Descrição do problema", value: laudo.descricaodoProblema, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={laudoTecnicoFields(laudo)}
          request={{ method: "patch", url: `/laudotecnico/update/${laudo.id}` }}
          successMessage="Laudo técnico atualizado!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
