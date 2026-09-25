"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { formatDateTime } from "@/lib/format";
import type { ClientesMunicipaisProps } from "@/lib/getClientesMunicipais.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { clienteMunicipalFields } from "./fields";

export function ClienteMunicipalModal({ data: instituicao, onClose }: EntityModalProps<ClientesMunicipaisProps>) {
  return (
    <DetailModal
      title={instituicao.name}
      subtitle="Cliente municipal"
      onClose={onClose}
      fields={[
        { label: "Tipo de unidade", value: instituicao.tipodeinstituicaoUnidade?.name },
        { label: "Telefone", value: instituicao.telefone },
        { label: "Cadastrado em", value: formatDateTime(instituicao.created_at) },
        { label: "Endereço", value: instituicao.endereco, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={clienteMunicipalFields(instituicao)}
          request={{ method: "patch", url: `/instituicaounidade/update/${instituicao.id}` }}
          transform={(payload) => ({ id: instituicao.id, ...payload })}
          submitLabel="Salvar alterações"
          successMessage="Instituição atualizada!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
