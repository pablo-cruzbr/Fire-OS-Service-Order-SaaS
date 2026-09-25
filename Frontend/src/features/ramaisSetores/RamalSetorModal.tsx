"use client";

import { DetailModal } from "@/components/data/DetailModal";
import { EntityForm } from "@/components/data/EntityForm";
import type { RamaisSetoresProps } from "@/lib/getRamaisSetores.type";
import type { EntityModalProps } from "@/features/modalTypes";
import { ramalSetorFields } from "./fields";

export function RamalSetorModal({ data: ramal, onClose }: EntityModalProps<RamaisSetoresProps>) {
  return (
    <DetailModal
      title={ramal.usuario}
      subtitle={`Ramal ${ramal.ramal}`}
      onClose={onClose}
      fields={[
        { label: "Ramal", value: ramal.ramal },
        { label: "Andar", value: ramal.andar },
        { label: "Setor", value: ramal.setor?.name },
        { label: "Vínculo", value: ramal.cliente?.name ?? ramal.instituicaoUnidade?.name ?? "Nenhum vínculo" },
        {
          label: "Localização",
          value: ramal.cliente?.endereco ?? ramal.instituicaoUnidade?.endereco,
          full: true,
        },
      ]}
      renderEdit={(done, cancel) => (
        <EntityForm
          fields={ramalSetorFields(ramal)}
          request={{ method: "patch", url: `/informacoessetor/${ramal.id}` }}
          transform={(payload) => ({ id: ramal.id, ...payload })}
          submitLabel="Salvar alterações"
          successMessage="Ramal atualizado!"
          onSuccess={done}
          onCancel={cancel}
        />
      )}
    />
  );
}
