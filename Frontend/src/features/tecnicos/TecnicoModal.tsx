"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { formatDateTime } from "@/lib/format";
import type { TecnicosProps } from "@/lib/getTecnicos.type";
import type { EntityModalProps } from "@/features/modalTypes";

/** Read-only: the API has no update route for técnicos. */
export function TecnicoModal({ data: tecnico, onClose }: EntityModalProps<TecnicosProps>) {
  return (
    <DetailModal
      title={tecnico.name}
      subtitle="Técnico"
      size="md"
      onClose={onClose}
      fields={[
        { label: "Nome", value: tecnico.name },
        { label: "Cadastrado em", value: formatDateTime(tecnico.created_at) },
      ]}
    />
  );
}
