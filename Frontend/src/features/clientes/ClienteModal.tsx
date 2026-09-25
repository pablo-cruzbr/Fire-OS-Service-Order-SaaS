"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { formatDateTime } from "@/lib/format";
import type { ClientesProps } from "@/lib/getCliente.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { clienteEditFields } from "./fields";

export function ClienteModal({ data: cliente, onClose }: EntityModalProps<ClientesProps>) {
  return (
    <DetailModal
      title={cliente.name}
      subtitle="Cliente privado"
      onClose={onClose}
      fields={[
        { label: "CNPJ", value: cliente.cnpj },
        { label: "Telefone", value: cliente.telefone },
        { label: "Cadastrado em", value: formatDateTime(cliente.created_at) },
        { label: "Endereço", value: cliente.endereco, full: true },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={clienteEditFields(cliente)}
          request={{ method: "patch", url: `/cliente/${cliente.id}` }}
          submitLabel="Salvar alterações"
          successMessage="Cliente atualizado!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
