"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import { StatusBadge } from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { relationName } from "@/lib/status";
import type { ComprasProps } from "@/lib/getCompras.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { compraFields } from "./fields";

export function ComprasModal({ data: compra, onClose }: EntityModalProps<ComprasProps>) {
  return (
    <DetailModal
      title={compra.itemSolicitado}
      subtitle="Solicitação de compra"
      onClose={onClose}
      fields={[
        { label: "Solicitante", value: compra.solicitante },
        { label: "Status", value: <StatusBadge status={relationName(compra.statusCompras, "")} /> },
        { label: "Preço", value: formatCurrency(compra.preco) },
        { label: "Criado em", value: formatDateTime(compra.created_at) },
        { label: "Motivo da solicitação", value: compra.motivoDaSolicitacao, full: true },
        {
          label: "Link de compra",
          full: true,
          value: compra.linkDeCompra ? (
            <a
              href={compra.linkDeCompra}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline-offset-2 hover:underline"
            >
              {compra.linkDeCompra}
            </a>
          ) : null,
        },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={compraFields(compra)}
          request={{ method: "patch", url: `/compra/update/${compra.id}` }}
          successMessage="Compra atualizada!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
