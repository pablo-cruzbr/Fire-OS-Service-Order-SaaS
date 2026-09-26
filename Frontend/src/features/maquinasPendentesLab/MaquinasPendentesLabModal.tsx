"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import type { MaquinasPendentesLabProps } from "@/lib/getMaquinasPendentesLab.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { maquinaPendenteLabFields } from "./fields";

export function MaquinasPendentesLabModal({ data: maquina, onClose }: EntityModalProps<MaquinasPendentesLabProps>) {
  return (
    <DetailModal
      title={maquina.equipamento?.name ?? "Máquina pendente"}
      subtitle="Máquina pendente laboratório"
      onClose={onClose}
      fields={[
        { label: "Patrimônio", value: maquina.equipamento?.patrimonio },
        { label: "Status", value: <StatusBadge status={maquina.statusMaquinasPendentesLab?.name} /> },
        { label: "Número de série", value: maquina.numeroDeSerie },
        { label: "ID da OS", value: maquina.idDaOs },
        { label: "SSD", value: maquina.ssd },
        { label: "Instituição / unidade", value: maquina.instituicaoUnidade?.name },
        { label: "Criado em", value: formatDateTime(maquina.created_at) },
        { label: "Observações", value: maquina.obs, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={maquinaPendenteLabFields(maquina)}
          request={{ method: "patch", url: `/controledemaquinaspendenteslab/update/${maquina.id}` }}
          successMessage="Máquina pendente atualizada!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
