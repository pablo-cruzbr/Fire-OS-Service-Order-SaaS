"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { formatDateTime } from "@/lib/format";
import type { EquipamentoProps } from "@/lib/getEquipamento.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { equipamentoFields } from "./fields";

export function EquipamentoModal({ data: equipamento, onClose }: EntityModalProps<EquipamentoProps>) {
  return (
    <DetailModal
      title={equipamento.name}
      subtitle="Equipamento"
      onClose={onClose}
      fields={[
        { label: "Patrimônio", value: equipamento.patrimonio },
        { label: "Tipo", value: equipamento.tipodeEquipamento?.name },
        { label: "Instituição / unidade", value: equipamento.instituicaoUnidade?.name ?? "Não vinculada" },
        { label: "Cadastrado em", value: formatDateTime(equipamento.created_at) },
        { label: "Endereço da unidade", value: equipamento.instituicaoUnidade?.endereco, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={equipamentoFields(equipamento)}
          request={{ method: "patch", url: `/equipamento/${equipamento.id}` }}
          successMessage="Equipamento atualizado!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
