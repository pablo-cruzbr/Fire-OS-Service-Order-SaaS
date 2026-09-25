"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { StatusBadge } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/format";
import type { MaquinasPendentesOroProps } from "@/lib/getMaquinasPendentesOro.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { maquinaPendenteOroFields } from "./fields";

export function MaquinasPendentesOroModal({ data: maquina, onClose }: EntityModalProps<MaquinasPendentesOroProps>) {
  return (
    <DetailModal
      title={maquina.equipamento?.name ?? "Máquina pendente"}
      subtitle="Máquina pendente ORO"
      onClose={onClose}
      fields={[
        { label: "Patrimônio", value: maquina.equipamento?.patrimonio },
        { label: "Status", value: <StatusBadge status={maquina.statusMaquinasPendentesOro?.name} /> },
        { label: "Data da instalação", value: formatDate(maquina.datadaInstalacao) },
        { label: "Instituição / unidade", value: maquina.instituicaoUnidade?.name },
        { label: "OS de instalação", value: maquina.osInstalacao },
        { label: "OS de retirada", value: maquina.osRetirada },
        { label: "Criado em", value: formatDateTime(maquina.created_at) },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={maquinaPendenteOroFields(maquina)}
          request={{ method: "patch", url: `/controledemaquinaspendentesoro/update/${maquina.id}` }}
          successMessage="Máquina pendente atualizada!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
